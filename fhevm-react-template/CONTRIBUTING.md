# Contributing to FHEVM SDK

Thank you for your interest in contributing to the FHEVM SDK!

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/fhevm-react-template.git
   cd fhevm-react-template
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build SDK**
   ```bash
   npm run build:sdk
   ```

4. **Run Examples**
   ```bash
   npm run dev:nextjs  # Next.js example
   npm run dev:vue     # Vue example
   npm run start:cli   # Node.js CLI
   ```

## Project Structure

- `packages/fhevm-sdk/` - Core SDK (framework-agnostic)
- `packages/nextjs-example/` - Next.js showcase
- `packages/vue-example/` - Vue.js example
- `packages/nodejs-example/` - Node.js CLI
- `examples/contract-deployment/` - Smart contract examples

## Making Changes

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Update documentation
5. Submit a pull request

## Code Style

- Use TypeScript for type safety
- Follow existing code formatting
- Add JSDoc comments for public APIs
- Write clear commit messages

## Testing

```bash
npm run test:sdk
```

## Documentation

Update relevant README files when adding features:
- Main README.md
- Package-specific READMEs
- API documentation

## Questions?

Open an issue on GitHub for any questions or discussions.
