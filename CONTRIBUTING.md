# Contributing to MoveMint NFT Contract

Thank you for your interest in contributing to the MoveMint NFT Contract! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

1. **Check existing issues** first to avoid duplicates
2. **Use the issue template** when creating new issues
3. **Provide detailed information** including:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)
   - Error messages and logs

### Suggesting Features

1. **Open a discussion** first to gauge community interest
2. **Describe the use case** and benefits
3. **Consider backwards compatibility**
4. **Provide implementation ideas** if possible

### Code Contributions

#### Prerequisites

- Node.js 16+ and npm
- Git
- Basic understanding of Solidity and Hardhat
- Familiarity with OpenZeppelin contracts

#### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/Move-Mint-Mantle.git
cd Move-Mint-Mantle

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Run tests to ensure everything works
npm test
```

#### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Follow coding standards**
   - Use consistent formatting
   - Add comprehensive comments
   - Follow Solidity style guide
   - Write meaningful commit messages

3. **Add tests**
   - Write unit tests for new functions
   - Ensure all existing tests pass
   - Aim for high test coverage

4. **Update documentation**
   - Update README if needed
   - Add JSDoc comments to new functions
   - Update integration docs if applicable

#### Code Style Guidelines

##### Solidity

```solidity
// Use clear, descriptive names
function mintDance(
    string memory title,
    string memory danceStyle,
    string memory choreographer,
    uint256 duration,
    string memory ipfsMetadataHash
) public returns (uint256) {
    // Validate inputs first
    require(bytes(title).length > 0, "Title cannot be empty");
    
    // Implementation...
}

// Add comprehensive comments
/**
 * @dev Mint a new dance performance NFT
 * @param title Title of the dance performance
 * @param danceStyle Style/genre of the dance
 * @param choreographer Name of the choreographer
 * @param duration Duration of the performance in seconds
 * @param ipfsMetadataHash IPFS hash containing full metadata JSON
 * @return tokenId The ID of the newly minted token
 */
```

##### TypeScript

```typescript
// Use interfaces for type safety
interface DanceMetadata {
  title: string;
  danceStyle: string;
  choreographer: string;
  duration: number;
  ipfsHash: string;
}

// Add JSDoc comments
/**
 * Mint a new dance NFT with metadata
 * @param metadata - Dance performance metadata
 * @returns Promise resolving to mint result
 */
async function mintDance(metadata: DanceMetadata): Promise<MintResult> {
  // Implementation...
}
```

#### Testing Guidelines

1. **Write comprehensive tests**
   ```typescript
   describe("mintDance", function () {
     it("should mint NFT with valid metadata", async function () {
       // Test implementation
     });
     
     it("should reject empty title", async function () {
       // Test validation
     });
   });
   ```

2. **Test edge cases**
   - Invalid inputs
   - Boundary conditions
   - Error scenarios

3. **Run all tests**
   ```bash
   npm test
   npm run test:coverage
   ```

#### Pull Request Process

1. **Ensure all tests pass**
   ```bash
   npm test
   npm run compile
   ```

2. **Update documentation**
   - README changes if needed
   - Code comments
   - Integration guides

3. **Create pull request**
   - Use descriptive title
   - Fill out PR template
   - Link related issues
   - Request review from maintainers

4. **Address feedback**
   - Respond to review comments
   - Make requested changes
   - Keep PR updated

## 🔒 Security Guidelines

### Reporting Security Issues

**DO NOT** open public issues for security vulnerabilities.

Instead:
1. Email security concerns to: [security@movemint.com]
2. Include detailed description
3. Provide steps to reproduce
4. Allow time for investigation before disclosure

### Security Best Practices

1. **Input Validation**
   - Validate all user inputs
   - Use require statements with clear messages
   - Check for edge cases

2. **Access Control**
   - Use OpenZeppelin's access control patterns
   - Minimize privileged functions
   - Document permission requirements

3. **Gas Optimization**
   - Avoid unbounded loops
   - Use efficient data structures
   - Consider gas costs in design

## 📋 Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Individual feature branches
- `hotfix/*` - Critical bug fixes

### Commit Messages

Use conventional commit format:

```
type(scope): description

feat(contract): add royalty support for individual tokens
fix(deploy): resolve gas estimation issue
docs(readme): update installation instructions
test(mint): add edge case validation tests
```

Types:
- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation changes
- `test` - Test additions/changes
- `refactor` - Code refactoring
- `style` - Formatting changes
- `chore` - Maintenance tasks

### Release Process

1. **Version Bump**
   - Update package.json version
   - Update contract version comments
   - Create changelog entry

2. **Testing**
   - Run full test suite
   - Deploy to testnet
   - Verify functionality

3. **Documentation**
   - Update README
   - Update integration docs
   - Create migration guide if needed

4. **Release**
   - Create GitHub release
   - Tag version
   - Deploy to production (if applicable)

## 🧪 Testing Standards

### Test Categories

1. **Unit Tests**
   - Individual function testing
   - Input validation
   - State changes

2. **Integration Tests**
   - Contract interactions
   - Event emissions
   - Gas usage

3. **End-to-End Tests**
   - Full workflow testing
   - Frontend integration
   - Network interactions

### Coverage Requirements

- Minimum 90% code coverage
- All public functions tested
- Edge cases covered
- Error conditions tested

## 📚 Resources

### Learning Resources

- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [ethers.js Documentation](https://docs.ethers.org/)

### Tools

- **Hardhat** - Development framework
- **OpenZeppelin** - Secure contract library
- **Slither** - Static analysis tool
- **Mythril** - Security analysis tool

## 🎯 Contribution Areas

We welcome contributions in these areas:

### Smart Contracts
- Gas optimization
- Security improvements
- Feature enhancements
- Bug fixes

### Documentation
- Code comments
- Integration guides
- Tutorials
- API documentation

### Testing
- Unit tests
- Integration tests
- Security tests
- Performance tests

### Tooling
- Deployment scripts
- Monitoring tools
- Development utilities
- CI/CD improvements

## 🏆 Recognition

Contributors will be recognized in:
- README contributors section
- Release notes
- Project documentation
- Community announcements

## 📞 Getting Help

- **GitHub Discussions** - General questions and ideas
- **GitHub Issues** - Bug reports and feature requests
- **Discord** - Real-time community chat
- **Documentation** - Comprehensive guides and references

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to MoveMint! Together, we're building the future of dance NFTs. 🕺💃