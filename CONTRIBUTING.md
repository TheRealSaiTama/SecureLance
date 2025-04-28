<p align="center">
  <img src="public/logo.png" alt="SecureLance Logo" width="250" />
</p>

<h1 align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=700&size=30&pause=1000&color=6366F1&center=true&vCenter=true&random=false&width=600&height=100&lines=Contributing+to+SecureLance;Building+the+Future+Together" alt="Typing SVG" />
</h1>

<div align="center">
  <p>
    <a href="#code-of-conduct"><img src="https://img.shields.io/badge/Code_of_Conduct-6366F1?style=for-the-badge" alt="Code of Conduct"></a>
    <a href="#how-to-contribute"><img src="https://img.shields.io/badge/How_to_Contribute-3B82F6?style=for-the-badge" alt="How to Contribute"></a>
    <a href="#development-workflow"><img src="https://img.shields.io/badge/Development_Workflow-60A5FA?style=for-the-badge" alt="Development Workflow"></a>
    <a href="#pull-request-process"><img src="https://img.shields.io/badge/Pull_Request_Process-93C5FD?style=for-the-badge" alt="Pull Request Process"></a>
  </p>
</div>

<br />

## ✨ Thank You for Contributing!

First off, thank you for considering contributing to SecureLance! It's people like you that make SecureLance such a great tool for freelancers and clients worldwide. This document provides guidelines and steps for contributing.

<br />

## 🌟 Code of Conduct

This project and everyone participating in it is governed by the [SecureLance Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [team@securelance.io](mailto:team@securelance.io).

<br />

## 🚀 How to Contribute

### Reporting Bugs

<table>
  <tr>
    <td width="80%">
      <p>Bugs are tracked as GitHub issues. Create an issue and provide the following information:</p>
      <ul>
        <li>Use a clear and descriptive title</li>
        <li>Describe the exact steps to reproduce the bug</li>
        <li>Describe the behavior you observed and what you expected to see</li>
        <li>Include screenshots if possible</li>
        <li>Mention your operating system, browser, and relevant environment details</li>
      </ul>
    </td>
    <td width="20%" align="center">
      <img src="https://github.githubassets.com/images/icons/emoji/unicode/1f41b.png" width="80" alt="Bug">
    </td>
  </tr>
</table>

### Suggesting Features

<table>
  <tr>
    <td width="20%" align="center">
      <img src="https://github.githubassets.com/images/icons/emoji/unicode/1f4a1.png" width="80" alt="Idea">
    </td>
    <td width="80%">
      <p>Feature suggestions are also tracked as GitHub issues. When creating a feature request:</p>
      <ul>
        <li>Use a clear and descriptive title</li>
        <li>Provide a detailed description of the suggested feature</li>
        <li>Explain why this feature would be useful to most SecureLance users</li>
        <li>Include mockups or examples if applicable</li>
        <li>Specify which part of the platform (frontend, smart contracts, backend) your suggestion relates to</li>
      </ul>
    </td>
  </tr>
</table>

### Code Contributions

SecureLance welcomes code contributions through pull requests from forks of this repository.

<br />

## 💻 Development Workflow

<div align="center">
  <img src="https://mermaid.ink/img/pako:eNp1kctuwjAQRX9l5FUr4Q3sKBKiXVQVFKrShVk48SSxcOzI4_BKEX8PJqEkQN2N595zx_IjqaRGQmTXwX7HW432IEUXrSP7zrGr0De0jvWO9w6PKpAd-wg1mJocuOD53LNBMoU9CVYPvnFf2SwHitbX8NZRg977zrNX-AAb3C_-IGJ8D18O-pi9utw8lDlPPS3ZKgl5uyjncT_i_aS5IdIU7SHGKomQV5HGeeEb7HfjQg1FcbTFXv_V8TsCdRI1SqUApYsYDOoYPJAsXITo-Bf0uoCFf5SRDcEVK2JydO5_oB5JlDeTtYUXcszXmxxqJGivSY5o-6pz0qa_ImcBsIqUqua6T_FUfwBo6JWt" width="700" alt="Development Workflow">
</div>

1. **Fork the Repository**
   - Click the "Fork" button at the top right of this repository

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/your-username/SecureLance.git
   cd SecureLance
   ```

3. **Create a Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

4. **Make Your Changes**
   - Make your changes to the codebase
   - Ensure your code follows our style guidelines
   - Write tests for your changes when applicable

5. **Test Your Changes**
   ```bash
   # For smart contracts
   npx hardhat test
   
   # For frontend
   npm run test
   
   # For backend
   cd backend && npm test
   ```

6. **Commit Your Changes**
   ```bash
   git commit -m "Add amazing feature"
   ```

7. **Push to Your Branch**
   ```bash
   git push origin feature/amazing-feature
   ```

8. **Create a Pull Request**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Select your branch and submit the pull request

<br />

## 📝 Pull Request Process

<ol>
  <li>Ensure any install or build dependencies are removed before the end of the layer when doing a build</li>
  <li>Update the README.md with details of changes to the interface, if applicable</li>
  <li>The PR should work for all supported platforms and browsers</li>
  <li>Your PR requires approval from at least one maintainer</li>
  <li>You may merge the PR once it has the sign-off from maintainers</li>
</ol>

<br />

## 🧪 Running Tests

```bash
# Smart contract tests
npx hardhat test

# Frontend component tests
npm run test:components

# Backend API tests
cd backend && npm run test:api
```

<br />

## 📋 Style Guide

- **Solidity**: Follow the [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- **JavaScript/TypeScript**: Follow the [Airbnb Style Guide](https://github.com/airbnb/javascript)
- **React**: Follow the [React Style Guide](https://reactjs.org/docs/style-guide.html)

<br />

## 🎉 Your Contributions Matter!

Your contributions to SecureLance help make it a better platform for freelancers and clients around the world. We appreciate your time, effort, and expertise in helping us build a more transparent and secure freelancing ecosystem on the blockchain.

<div align="center">
  <p>
    <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=100&section=footer" width="100%" alt="Wave Footer" />
  </p>
  <p>
    <strong>SecureLance Team</strong> - Building the future of work together
  </p>
</div>