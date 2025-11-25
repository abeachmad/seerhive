# Contributing

Thank you for your interest in contributing to SeerHive! This guide will help you get started.

## Ways to Contribute

- 🐛 Report bugs
- 💡 Suggest features
- 📝 Improve documentation
- 🔧 Fix issues
- ✨ Add new features
- 🧪 Write tests
- 🎨 Improve UI/UX

## Getting Started

### 1. Fork Repository

```bash
# Fork on GitHub, then clone
git clone https://github.com/YOUR_USERNAME/seerhive.git
cd seerhive
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Create Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 4. Make Changes

Follow our [Development Guidelines](#development-guidelines)

### 5. Test Changes

```bash
# Run tests
pnpm test

# Run linter
pnpm lint

# Build project
pnpm build
```

### 6. Commit Changes

```bash
git add .
git commit -m "feat: add new feature"
# or
git commit -m "fix: resolve bug"
```

Follow [Conventional Commits](#commit-conventions)

### 7. Push & Create PR

```bash
git push origin feature/your-feature-name
```

Create Pull Request on GitHub with:
- Clear description
- Related issue number
- Screenshots (if UI changes)
- Test results

## Development Guidelines

### Code Style

Follow existing patterns in the codebase:

**TypeScript**:
- Strict mode enabled
- Explicit types preferred
- Avoid `any` except in error handling

**React**:
- Functional components
- Hooks for state management
- Component variants for different providers

**Naming**:
- Components: PascalCase (`TradeDialog.tsx`)
- Utilities: camelCase (`gasless.ts`)
- Constants: UPPER_SNAKE_CASE (`PREDICTION_MARKET_ABI`)

### File Organization

```typescript
// 1. Imports (external, internal, types, assets)
import { useState } from 'react';
import { useStore } from '@/lib/store';
import type { Market } from '@/types/market';
import { X } from 'lucide-react';

// 2. Interface definitions
interface Props {
  market: Market;
  onClose: () => void;
}

// 3. Component function
export function Component({ market, onClose }: Props) {
  // 4. State
  const [loading, setLoading] = useState(false);
  
  // 5. Hooks
  useEffect(() => { }, []);
  
  // 6. Handlers
  const handleAction = () => { };
  
  // 7. JSX
  return <div>...</div>;
}
```

### Testing Requirements

All contributions should include tests:

**Smart Contracts**:
```typescript
it('Should create a market', async function () {
  const tx = await market.createMarket('Test?', 86400);
  await tx.wait();
  
  const data = await market.markets(0);
  expect(data.question).to.equal('Test?');
});
```

**API Routes**:
```bash
curl -X POST http://localhost:3000/api/your-endpoint \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

**Frontend**:
- Manual testing in demo mode
- Manual testing in on-chain mode
- Screenshot of changes

### Documentation

Update documentation for:
- New features
- API changes
- Configuration changes
- Breaking changes

## Commit Conventions

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(gasless): add Pimlico paymaster fallback
fix(ai): handle Tavily API timeout
docs(wiki): add deployment guide
style(ui): improve button spacing
refactor(contracts): optimize gas usage
test(api): add sponsor endpoint tests
chore(deps): update dependencies
```

### Scope

- `gasless`: Account abstraction
- `ai`: AI resolution
- `contracts`: Smart contracts
- `ui`: User interface
- `api`: API routes
- `docs`: Documentation
- `config`: Configuration

## Pull Request Guidelines

### PR Title

Use conventional commit format:
```
feat(gasless): add Pimlico paymaster fallback
```

### PR Description

Include:

```markdown
## Description
Brief description of changes

## Related Issue
Fixes #123

## Changes
- Added Pimlico paymaster adapter
- Updated sponsor API to try Particle first
- Added fallback logic

## Testing
- [x] Contract tests pass
- [x] API tests pass
- [x] Manual testing complete

## Screenshots
(if applicable)
```

### PR Checklist

- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Commit messages follow conventions
- [ ] No console errors
- [ ] Builds successfully

## Code Review Process

1. **Automated Checks**: CI runs tests and linting
2. **Maintainer Review**: Core team reviews code
3. **Feedback**: Address review comments
4. **Approval**: PR approved by maintainer
5. **Merge**: Squash and merge to main

## Issue Guidelines

### Bug Reports

Use bug report template:

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g. macOS]
- Browser: [e.g. Chrome]
- Version: [e.g. 1.0.0]

**Additional context**
Any other information
```

### Feature Requests

Use feature request template:

```markdown
**Is your feature request related to a problem?**
Description of problem

**Describe the solution**
How should it work?

**Describe alternatives**
Other solutions considered

**Additional context**
Any other information
```

## Development Setup

### Prerequisites

- Node.js 20.x
- pnpm 10.x
- Git

### Environment Setup

```bash
# Frontend
cp apps/web/.env.example apps/web/.env.local
# Edit with your API keys

# Contracts
cp contracts/.env.example contracts/.env
# Add your private key
```

### Running Locally

```bash
# Start all workspaces
pnpm dev

# Or individually
cd apps/web && pnpm dev
cd contracts && pnpm test
```

### Testing

```bash
# All tests
pnpm test

# Contract tests
cd contracts && pnpm test

# API tests
./scripts/test-sponsor.sh
./scripts/test-ai-resolve.sh

# Gasless flow
./scripts/smoke-gasless.sh
```

## Areas for Contribution

### High Priority

- [ ] UMA Optimistic Oracle integration
- [ ] Challenge/dispute UI
- [ ] Mobile responsive improvements
- [ ] Performance optimization
- [ ] Security audit fixes

### Medium Priority

- [ ] Copy trading features
- [ ] Reputation system
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Dark mode improvements

### Low Priority

- [ ] Additional chart types
- [ ] Export data features
- [ ] Keyboard shortcuts
- [ ] Accessibility improvements
- [ ] Animation polish

### Good First Issues

Look for issues labeled `good first issue`:
- Documentation improvements
- UI polish
- Test coverage
- Bug fixes

## Community

### Communication

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Discord**: Coming soon
- **Twitter**: Coming soon

### Code of Conduct

Be respectful and inclusive:
- Use welcoming language
- Respect differing viewpoints
- Accept constructive criticism
- Focus on what's best for community

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

## Questions?

- Read [Documentation](Home)
- Check [FAQ](FAQ)
- Open GitHub Discussion
- Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Next Steps

- [Getting Started](Getting-Started) - Setup development environment
- [Architecture](Architecture) - Understand the codebase
- [Testing](Testing) - Learn testing practices
