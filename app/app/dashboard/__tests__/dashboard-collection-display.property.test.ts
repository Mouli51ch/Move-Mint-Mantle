/**
 * Property-Based Tests for Dashboard Collection Display
 * 
 * **Feature: universal-minting-engine-integration, Property 6: Dashboard collection display**
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**
 * 
 * Tests the dashboard NFT collection management including API integration,
 * search/filtering functionality, and dance-themed presentation.
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import * as fc from 'fast-check';
import DashboardPage from '../page';
import { universalMintingEngineService } from '@/lib/api/service';

// Mock the API service
jest.mock('@/lib/api/service', () => ({
  universalMintingEngineService: {
    getNFTs: jest.fn(),
    getAssets: jest.fn(),
  },
}));

// Mock the wallet hook
jest.mock('@/hooks/use-wallet', () => ({
  useWallet: () => ({
    connection: {
      address: '0x1234567890123456789012345678901234567890',
      chainId: 1513,
      isConnected: true,
      provider: {},
      signer: {},
      balance: '1.0'
    },
    isConnected: true,
    isCorrectNetwork: true,
  }),
}));

// Mock Next.js components
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

describe('Dashboard Collection Display Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 6: Dashboard collection display
   * For any collection of NFTs, the dashboard should display them with dance-themed 
   * presentation, provide search/filtering, and show accurate statistics
   * **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**
   */
  describe('Property 6: Dashboard collection display', () => {
    it('should display NFT collections with dance-themed presentation consistently', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate NFT collection variations
          fc.array(
            fc.record({
              contractAddress: fc.hexaString({ minLength: 40, maxLength: 40 }).map(s => `0x${s}`),
              tokenId: fc.integer({ min: 1, max: 10000 }).map(n => n.toString()),
              metadata: fc.record({
                name: fc.string({ minLength: 1, maxLength: 60 }),
                description: fc.string({ maxLength: 500 }),
                image: fc.option(fc.webUrl()),
                animation_url: fc.option(fc.webUrl()),
                danceStyle: fc.array(fc.constantFrom('Ballet', 'Hip-Hop', 'Contemporary', 'Jazz', 'Salsa'), { minLength: 1, maxLength: 3 }),
                difficulty: fc.constantFrom('Beginner', 'Intermediate', 'Advanced'),
                analysisData: fc.record({
                  duration: fc.integer({ min: 30, max: 600 }),
                  detectedMovements: fc.array(
                    fc.record({
                      name: fc.constantFrom('Pirouette', 'Grand Jeté', 'Pop', 'Lock', 'Chassé'),
                      type: fc.constantFrom('Ballet', 'Hip-Hop', 'Contemporary', 'Jazz'),
                      confidence: fc.float({ min: 0.5, max: 1.0 }),
                    }),
                    { minLength: 1, maxLength: 5 }
                  ),
                }),
                attributes: fc.array(
                  fc.record({
                    trait_type: fc.string(),
                    value: fc.oneof(fc.string(), fc.integer()),
                    display_type: fc.option(fc.constantFrom('number', 'date')),
                  })
                ),
              }),
              mintedAt: fc.date({ min: new Date('2024-01-01'), max: new Date() }).map(d => d.toISOString()),
              transactionHash: fc.hexaString({ minLength: 64, maxLength: 64 }).map(s => `0x${s}`),
            }),
            { minLength: 0, maxLength: 20 }
          ),
          async (nftCollection) => {
            // Mock API response
            const mockGetNFTs = universalMintingEngineService.getNFTs as jest.MockedFunction<typeof universalMintingEngineService.getNFTs>;
            mockGetNFTs.mockResolvedValue({
              nfts: nftCollection,
              total: nftCollection.length,
              page: 1,
              limit: 12,
              hasMore: false,
            });

            // Render the dashboard
            render(<DashboardPage />);

            // Wait for loading to complete
            await waitFor(() => {
              expect(screen.queryByText('Loading your NFT collection...')).not.toBeInTheDocument();
            });

            if (nftCollection.length === 0) {
              // Should show empty state
              expect(screen.getByText('No NFTs Found')).toBeInTheDocument();
              expect(screen.getByText("You haven't minted any dance NFTs yet. Create your first move!")).toBeInTheDocument();
            } else {
              // Should display collection statistics
              expect(screen.getByText('Total NFTs')).toBeInTheDocument();
              expect(screen.getByText('Dance Styles')).toBeInTheDocument();
              
              // Should display NFTs with dance-themed presentation
              nftCollection.slice(0, 12).forEach(nft => {
                expect(screen.getByText(nft.metadata.name)).toBeInTheDocument();
                
                // Should show dance styles as tags
                nft.metadata.danceStyle.forEach(style => {
                  expect(screen.getByText(style)).toBeInTheDocument();
                });
                
                // Should show difficulty level
                expect(screen.getByText(nft.metadata.difficulty)).toBeInTheDocument();
              });

              // Should calculate correct statistics
              const uniqueStyles = new Set(nftCollection.flatMap(nft => nft.metadata.danceStyle));
              expect(screen.getByText(uniqueStyles.size.toString())).toBeInTheDocument();
            }
          }
        ),
        { numRuns: 10, timeout: 10000 }
      );
    });

    it('should provide functional search and filtering consistently', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate diverse NFT collection for filtering tests
          fc.constant([
            {
              contractAddress: '0x1234567890123456789012345678901234567890',
              tokenId: '1',
              metadata: {
                name: 'Ballet Performance',
                description: 'Classical ballet routine',
                danceStyle: ['Ballet', 'Classical'],
                difficulty: 'Advanced',
                analysisData: {
                  duration: 180,
                  detectedMovements: [
                    { name: 'Pirouette', type: 'Ballet', confidence: 0.95 }
                  ],
                },
                attributes: [],
              },
              mintedAt: '2025-01-15T00:00:00Z',
              transactionHash: '0xabc123',
            },
            {
              contractAddress: '0x1234567890123456789012345678901234567890',
              tokenId: '2',
              metadata: {
                name: 'Hip-Hop Freestyle',
                description: 'Street dance moves',
                danceStyle: ['Hip-Hop', 'Street'],
                difficulty: 'Beginner',
                analysisData: {
                  duration: 120,
                  detectedMovements: [
                    { name: 'Pop', type: 'Hip-Hop', confidence: 0.88 }
                  ],
                },
                attributes: [],
              },
              mintedAt: '2025-01-10T00:00:00Z',
              transactionHash: '0xdef456',
            }
          ]),
          fc.record({
            searchQuery: fc.oneof(
              fc.constant('ballet'),
              fc.constant('hip-hop'),
              fc.constant('pirouette'),
              fc.constant('freestyle'),
              fc.constant('')
            ),
            styleFilter: fc.oneof(
              fc.constant('all'),
              fc.constant('Ballet'),
              fc.constant('Hip-Hop')
            ),
            sortBy: fc.constantFrom('created', 'views', 'title'),
            sortOrder: fc.constantFrom('asc', 'desc'),
          }),
          async (nftCollection, filters) => {
            // Mock API response
            const mockGetNFTs = universalMintingEngineService.getNFTs as jest.MockedFunction<typeof universalMintingEngineService.getNFTs>;
            mockGetNFTs.mockResolvedValue({
              nfts: nftCollection,
              total: nftCollection.length,
              page: 1,
              limit: 12,
              hasMore: false,
            });

            // Render the dashboard
            render(<DashboardPage />);

            // Wait for loading to complete
            await waitFor(() => {
              expect(screen.queryByText('Loading your NFT collection...')).not.toBeInTheDocument();
            });

            // Apply search filter
            if (filters.searchQuery) {
              const searchInput = screen.getByPlaceholderText('Search by title, moves, or style...');
              await act(async () => {
                fireEvent.change(searchInput, { target: { value: filters.searchQuery } });
              });
            }

            // Apply style filter
            if (filters.styleFilter !== 'all') {
              const styleSelect = screen.getByDisplayValue('All Styles');
              await act(async () => {
                fireEvent.change(styleSelect, { target: { value: filters.styleFilter } });
              });
            }

            // Apply sorting
            const sortSelect = screen.getByDisplayValue('Date Created');
            await act(async () => {
              fireEvent.change(sortSelect, { target: { value: filters.sortBy } });
            });

            // Verify filtering works correctly
            const expectedResults = nftCollection.filter(nft => {
              // Search filter
              if (filters.searchQuery) {
                const query = filters.searchQuery.toLowerCase();
                const matchesSearch = 
                  nft.metadata.name.toLowerCase().includes(query) ||
                  nft.metadata.danceStyle.some(style => style.toLowerCase().includes(query)) ||
                  nft.metadata.analysisData.detectedMovements.some(move => move.name.toLowerCase().includes(query));
                if (!matchesSearch) return false;
              }

              // Style filter
              if (filters.styleFilter !== 'all') {
                if (!nft.metadata.danceStyle.includes(filters.styleFilter)) return false;
              }

              return true;
            });

            // Should show correct number of results
            if (expectedResults.length === 0) {
              expect(screen.getByText('No Results Found')).toBeInTheDocument();
            } else {
              expectedResults.forEach(nft => {
                expect(screen.getByText(nft.metadata.name)).toBeInTheDocument();
              });
            }
          }
        ),
        { numRuns: 8, timeout: 15000 }
      );
    });

    it('should handle view switching consistently', async () => {
      await fc.assert(
        fc.property(
          fc.array(
            fc.record({
              contractAddress: fc.hexaString({ minLength: 40, maxLength: 40 }).map(s => `0x${s}`),
              tokenId: fc.integer({ min: 1, max: 100 }).map(n => n.toString()),
              metadata: fc.record({
                name: fc.string({ minLength: 1, maxLength: 60 }),
                description: fc.string({ maxLength: 200 }),
                danceStyle: fc.array(fc.constantFrom('Ballet', 'Hip-Hop', 'Jazz'), { minLength: 1, maxLength: 2 }),
                difficulty: fc.constantFrom('Beginner', 'Intermediate', 'Advanced'),
                analysisData: fc.record({
                  duration: fc.integer({ min: 30, max: 300 }),
                  detectedMovements: fc.array(
                    fc.record({
                      name: fc.constantFrom('Pirouette', 'Jump', 'Spin'),
                      type: fc.constantFrom('Ballet', 'Hip-Hop', 'Jazz'),
                      confidence: fc.float({ min: 0.5, max: 1.0 }),
                    }),
                    { minLength: 1, maxLength: 3 }
                  ),
                }),
                attributes: [],
              }),
              mintedAt: fc.date().map(d => d.toISOString()),
              transactionHash: fc.hexaString({ minLength: 64, maxLength: 64 }).map(s => `0x${s}`),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (nftCollection) => {
            // Mock API response
            const mockGetNFTs = universalMintingEngineService.getNFTs as jest.MockedFunction<typeof universalMintingEngineService.getNFTs>;
            mockGetNFTs.mockResolvedValue({
              nfts: nftCollection,
              total: nftCollection.length,
              page: 1,
              limit: 12,
              hasMore: false,
            });

            // Render the dashboard
            render(<DashboardPage />);

            // Should start in grid view by default
            const gridButton = screen.getAllByRole('button').find(btn => 
              btn.querySelector('svg path[d*="M3 3h8v8H3V3z"]')
            );
            expect(gridButton).toHaveClass('bg-green-600');

            // Switch to list view
            const listButton = screen.getAllByRole('button').find(btn => 
              btn.querySelector('svg path[d*="M3 4h18v2H3V4z"]')
            );
            
            act(() => {
              fireEvent.click(listButton!);
            });

            // Should show list view
            expect(listButton).toHaveClass('bg-green-600');
            
            // Should display table headers in list view
            expect(screen.getByText('NFT')).toBeInTheDocument();
            expect(screen.getByText('Dance Style')).toBeInTheDocument();
            expect(screen.getByText('Movements')).toBeInTheDocument();

            // Switch back to grid view
            act(() => {
              fireEvent.click(gridButton!);
            });

            // Should show grid view again
            expect(gridButton).toHaveClass('bg-green-600');
          }
        ),
        { numRuns: 5 }
      );
    });

    it('should calculate collection statistics accurately', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              contractAddress: fc.hexaString({ minLength: 40, maxLength: 40 }).map(s => `0x${s}`),
              tokenId: fc.integer({ min: 1, max: 1000 }).map(n => n.toString()),
              metadata: fc.record({
                name: fc.string({ minLength: 1, maxLength: 60 }),
                description: fc.string({ maxLength: 200 }),
                danceStyle: fc.array(fc.constantFrom('Ballet', 'Hip-Hop', 'Contemporary', 'Jazz', 'Salsa'), { minLength: 1, maxLength: 3 }),
                difficulty: fc.constantFrom('Beginner', 'Intermediate', 'Advanced'),
                analysisData: fc.record({
                  duration: fc.integer({ min: 30, max: 600 }),
                  detectedMovements: fc.array(
                    fc.record({
                      name: fc.string({ minLength: 1, maxLength: 20 }),
                      type: fc.string(),
                      confidence: fc.float({ min: 0.5, max: 1.0 }),
                    }),
                    { minLength: 1, maxLength: 5 }
                  ),
                }),
                attributes: fc.array(
                  fc.record({
                    trait_type: fc.oneof(fc.constant('Price'), fc.string()),
                    value: fc.oneof(fc.string(), fc.float({ min: 0, max: 100 })),
                  })
                ),
              }),
              mintedAt: fc.date().map(d => d.toISOString()),
              transactionHash: fc.hexaString({ minLength: 64, maxLength: 64 }).map(s => `0x${s}`),
            }),
            { minLength: 0, maxLength: 15 }
          ),
          async (nftCollection) => {
            // Mock API response
            const mockGetNFTs = universalMintingEngineService.getNFTs as jest.MockedFunction<typeof universalMintingEngineService.getNFTs>;
            mockGetNFTs.mockResolvedValue({
              nfts: nftCollection,
              total: nftCollection.length,
              page: 1,
              limit: 12,
              hasMore: false,
            });

            // Render the dashboard
            render(<DashboardPage />);

            // Wait for loading to complete
            await waitFor(() => {
              expect(screen.queryByText('Loading your NFT collection...')).not.toBeInTheDocument();
            });

            // Calculate expected statistics
            const expectedTotalNFTs = nftCollection.length;
            const expectedUniqueStyles = new Set(nftCollection.flatMap(nft => nft.metadata.danceStyle)).size;

            // Verify statistics are displayed correctly
            expect(screen.getByText(expectedTotalNFTs.toString())).toBeInTheDocument();
            expect(screen.getByText(expectedUniqueStyles.toString())).toBeInTheDocument();

            // Verify Total NFTs label
            expect(screen.getByText('Total NFTs')).toBeInTheDocument();
            expect(screen.getByText('Dance Styles')).toBeInTheDocument();
          }
        ),
        { numRuns: 10, timeout: 10000 }
      );
    });
  });
});