import { render, act } from '@testing-library/react'
import { CertificateProvider, useCertificates } from '@/components/CertificateContext'
import { certificateService } from '@/utils/blockchain'

// Mock the blockchain service
jest.mock('@/utils/blockchain', () => ({
  certificateService: {
    getCertificate: jest.fn(),
  },
}))

describe('CertificateContext', () => {
  const Wrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
    <CertificateProvider>{children}</CertificateProvider>
  )

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('provides certificates context to children', () => {
    const TestComponent = () => {
      const { certificates } = useCertificates()
      return <div data-testid="test">{certificates.length}</div>
    }

    const { getByTestId } = render(
      <TestComponent />,
      { wrapper: Wrapper }
    )
    expect(getByTestId('test').textContent).toBe('0')
  })

  it('fetches certificates from localStorage and blockchain', async () => {
    const mockCertificate = {
      id: '1',
      recipientName: 'Test User',
      recipientAddress: '0x123',
      certificateType: 'Test',
      issueDate: '2025-09-14',
      institutionName: 'Test Institution',
      status: 'active' as const,
    }

    // Setup localStorage with mock data
    localStorage.setItem('certificates', JSON.stringify([mockCertificate]))

    // Mock blockchain service response
    ;(certificateService.getCertificate as jest.Mock).mockResolvedValue(mockCertificate)

    const TestComponent = () => {
      const { certificates } = useCertificates()
      return <div data-testid="test">{certificates.length}</div>
    }

    let component: any
    await act(async () => {
      component = render(<TestComponent />, { wrapper: Wrapper })
    })

    expect(component.getByTestId('test').textContent).toBe('1')
    expect(certificateService.getCertificate).toHaveBeenCalledWith('1')
  })

  it('adds new certificates', async () => {
    const mockCertificate = {
      id: '2',
      recipientName: 'New User',
      recipientAddress: '0x456',
      certificateType: 'Test',
      issueDate: '2025-09-14',
      institutionName: 'Test Institution',
      status: 'active' as const,
    }

    const TestComponent = () => {
      const { certificates, addCertificate } = useCertificates()
      return (
        <>
          <div data-testid="count">{certificates.length}</div>
          <button onClick={() => addCertificate(mockCertificate)}>Add</button>
        </>
      )
    }

    const { getByText, getByTestId } = render(<TestComponent />, { wrapper: Wrapper })

    expect(getByTestId('count').textContent).toBe('0')

    await act(async () => {
      getByText('Add').click()
    })

    expect(getByTestId('count').textContent).toBe('1')
    expect(JSON.parse(localStorage.getItem('certificates') || '[]')).toHaveLength(1)
  })
})
