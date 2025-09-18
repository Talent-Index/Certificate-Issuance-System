import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import RecipientDashboard from '@/app/recipient-dashboard/page'
import { CertificateProvider } from '@/components/CertificateContext'
import { certificateService } from '@/utils/blockchain'
import { toast } from 'react-hot-toast'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock the blockchain service
jest.mock('@/utils/blockchain', () => ({
  certificateService: {
    verifyCertificate: jest.fn(),
    transferCertificate: jest.fn(),
    getCertificate: jest.fn(),
  },
}))

// Mock toast notifications
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('RecipientDashboard', () => {
  const mockRouter = {
    push: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    // Mock localStorage for waitlist status
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'true'), // Default to waitlisted
        setItem: jest.fn(),
      },
      writable: true,
    })
  })

  const renderDashboard = () => {
    return render(
      <CertificateProvider>
        <RecipientDashboard />
      </CertificateProvider>
    )
  }

  describe('Authentication & Access Control', () => {
    it('redirects non-waitlisted users', () => {
      ;(window.localStorage.getItem as jest.Mock).mockReturnValueOnce('false')
      renderDashboard()
      expect(mockRouter.push).toHaveBeenCalledWith('/')
    })

    it('displays dashboard for waitlisted users', () => {
      renderDashboard()
      expect(screen.getByText('My Certificates')).toBeInTheDocument()
    })
  })

  describe('Certificate Verification', () => {
    it('handles certificate verification successfully', async () => {
      const user = userEvent.setup()
      ;(certificateService.verifyCertificate as jest.Mock).mockResolvedValueOnce(true)
      
      renderDashboard()
      
      const verifyInput = screen.getByLabelText(/certificate id/i)
      const verifyButton = screen.getByRole('button', { name: /verify certificate/i })
      
      await user.type(verifyInput, '123')
      await user.click(verifyButton)
      
      expect(certificateService.verifyCertificate).toHaveBeenCalledWith('123')
      expect(toast.success).toHaveBeenCalled()
    })

    it('handles verification failure', async () => {
      const user = userEvent.setup()
      ;(certificateService.verifyCertificate as jest.Mock).mockResolvedValueOnce(false)
      
      renderDashboard()
      
      const verifyInput = screen.getByLabelText(/certificate id/i)
      const verifyButton = screen.getByRole('button', { name: /verify certificate/i })
      
      await user.type(verifyInput, '999')
      await user.click(verifyButton)
      
      expect(certificateService.verifyCertificate).toHaveBeenCalledWith('999')
      expect(toast.error).toHaveBeenCalled()
    })
  })

  describe('Certificate Transfer', () => {
    it('handles certificate transfer successfully', async () => {
      const user = userEvent.setup()
      ;(certificateService.transferCertificate as jest.Mock).mockResolvedValueOnce(true)
      
      renderDashboard()
      
      const certificateIdInput = screen.getByLabelText(/certificate id/i)
      const recipientAddressInput = screen.getByLabelText(/recipient address/i)
      const transferButton = screen.getByRole('button', { name: /transfer certificate/i })
      
      await user.type(certificateIdInput, '123')
      await user.type(recipientAddressInput, '0x123...')
      await user.click(transferButton)
      
      expect(certificateService.transferCertificate).toHaveBeenCalledWith('123', '0x123...')
      expect(toast.success).toHaveBeenCalled()
    })

    it('validates recipient address format', async () => {
      const user = userEvent.setup()
      renderDashboard()
      
      const certificateIdInput = screen.getByLabelText(/certificate id/i)
      const recipientAddressInput = screen.getByLabelText(/recipient address/i)
      const transferButton = screen.getByRole('button', { name: /transfer certificate/i })
      
      await user.type(certificateIdInput, '123')
      await user.type(recipientAddressInput, 'invalid-address')
      await user.click(transferButton)
      
      expect(certificateService.transferCertificate).not.toHaveBeenCalled()
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('invalid'))
    })
  })

  describe('Certificate List Display', () => {
    it('displays user certificates', async () => {
      const mockCertificates = [
        {
          id: '1',
          recipientName: 'John Doe',
          issueDate: '2025-09-18',
          status: 'active',
        },
        {
          id: '2',
          recipientName: 'Jane Doe',
          issueDate: '2025-09-18',
          status: 'active',
        },
      ]

      ;(certificateService.getCertificate as jest.Mock).mockResolvedValue(mockCertificates[0])
      
      renderDashboard()
      
      // Wait for certificates to load
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })
    })

    it('handles empty certificate list', async () => {
      ;(certificateService.getCertificate as jest.Mock).mockResolvedValue(null)
      
      renderDashboard()
      
      await waitFor(() => {
        expect(screen.getByText(/no certificates found/i)).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles network errors gracefully', async () => {
      const user = userEvent.setup()
      ;(certificateService.verifyCertificate as jest.Mock).mockRejectedValue(new Error('Network error'))
      
      renderDashboard()
      
      const verifyInput = screen.getByLabelText(/certificate id/i)
      const verifyButton = screen.getByRole('button', { name: /verify certificate/i })
      
      await user.type(verifyInput, '123')
      await user.click(verifyButton)
      
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('error'))
    })
  })
})
