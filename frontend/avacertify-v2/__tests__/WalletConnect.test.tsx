import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { WalletConnect } from '@/components/wallet-connect'
import { useToast } from '@/hooks/use-toast'

// Mock the useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}))

// Mock window.ethereum and window.avalanche
const mockEthereum = {
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
}

const mockAvalanche = {
  request: jest.fn(),
}

describe('WalletConnect', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
    window.ethereum = mockEthereum
    window.avalanche = mockAvalanche
  })

  it('renders connect wallet button when not connected', () => {
    render(<WalletConnect />)
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument()
  })

  it('connects to MetaMask when selected', async () => {
    mockEthereum.request
      .mockResolvedValueOnce([]) // First call for checkConnection
      .mockResolvedValueOnce([]) // eth_requestAccounts
      .mockResolvedValueOnce(['0x123']) // eth_accounts

    render(<WalletConnect />)
    
    const connectButton = screen.getByText('Connect Wallet')
    fireEvent.click(connectButton)
    
    const metamaskOption = screen.getByText('Connect MetaMask')
    fireEvent.click(metamaskOption)

    await waitFor(() => {
      expect(mockEthereum.request).toHaveBeenCalledWith({ method: 'eth_requestAccounts' })
    })
  })

  it('connects to Core wallet when selected', async () => {
    mockAvalanche.request
      .mockResolvedValueOnce([]) // First call for checkConnection
      .mockResolvedValueOnce([]) // eth_requestAccounts
      .mockResolvedValueOnce(['0x123']) // eth_accounts

    render(<WalletConnect />)
    
    const connectButton = screen.getByText('Connect Wallet')
    fireEvent.click(connectButton)
    
    const coreOption = screen.getByText('Connect Core Wallet')
    fireEvent.click(coreOption)

    await waitFor(() => {
      expect(mockAvalanche.request).toHaveBeenCalledWith({ method: 'eth_requestAccounts' })
    })
  })

  it('shows error toast when MetaMask is not installed', async () => {
    window.ethereum = undefined
    const mockToast = jest.fn()
    ;(useToast as jest.Mock).mockReturnValue({ toast: mockToast })

    render(<WalletConnect />)
    
    const connectButton = screen.getByText('Connect Wallet')
    fireEvent.click(connectButton)
    
    const metamaskOption = screen.getByText('Connect MetaMask')
    fireEvent.click(metamaskOption)

    expect(mockToast).toHaveBeenCalledWith({
      title: 'MetaMask Not Found',
      description: expect.any(String),
      variant: 'destructive',
    })
  })

  it('disconnects wallet when disconnect is clicked', async () => {
    mockEthereum.request.mockResolvedValue(['0x123'])
    const mockToast = jest.fn()
    ;(useToast as jest.Mock).mockReturnValue({ toast: mockToast })

    render(<WalletConnect />)
    
    // First connect the wallet
    await waitFor(() => {
      expect(screen.getByText('0x123...123')).toBeInTheDocument()
    })

    // Click disconnect
    const disconnectButton = screen.getByText('Disconnect Wallet')
    fireEvent.click(disconnectButton)

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Wallet Disconnected',
      description: expect.any(String),
    })
  })
})
