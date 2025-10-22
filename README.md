# Sistem Informasi Pengendalian Pencemaran dan Kerusakan Lingkungan Hidup (SATGAS PPKLH)

<div align="center">

<!-- prettier-ignore -->
[comment]: <div> ( <!-- prettier-ignore --> )
[![Version](https://img.shields.io/github/package-json/v/Code-With-Us/codeguide-starter-fullstack?style=for-the-badge&logo=github)](https://github.com/Code-With-Us/codeguide-starter-fullstack)
[![License](https://img.shields.io/github/license/Code-With-Us/codeguide-starter-fullstack?style=for-the-badge&logo=opensourceinitiative&labelColor=2D333B)](https://github.com/Code-With-Us/codeguide-starter-fullstack/blob/main/LICENSE)
[![Stars](https://img.shields.io/github/stars/Code-With-Us/codeguide-starter-fullstack?style=for-the-badge&logo=github&label=Stars&labelColor=2D333B)](https://github.com/Code-With-Us/codeguide-starter-fullstack)
[![Forks](https://img.shields.io/github/forks/Code-With-Us/codeguide-starter-fullstack?style=for-the-badge&logo=github&label=Forks&labelColor=2D333B)](https://github.com/Code-With-Us/codeguide-starter-fullstack)

</div>

<div align="center">
  <img src="codeguide-backdrop.svg" width="100%" />
</div>

<br />

<div align="center">
  <h3>Full-stack Next.js Starter | TypeScript | Prisma ORM | MySQL | Auth.js | Shadcn UI</h3>
</div>

<div align="center">

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Code-With-Us/codeguide-starter-fullstack&env=DATABASE_URL,BETTER_AUTH_SECRET&envDescription=Environment%20variables%20needed%20for%20deployment&envLink=link-to-env-variables-docs)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Code-With-Us/codeguide-starter-fullstack)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template-url)

</div>

## 📋 Table of Contents

- [Sistem Informasi Pengendalian Pencemaran dan Kerusakan Lingkungan Hidup (SATGAS PPKLH)](#-sistem-informasi-pengendalian-pencemaran-dan-kerusakan-lingkungan-hidup-satgas-ppklh)
  - [📋 Table of Contents](#-table-of-contents)
  - [🎯 About The Project](#-about-the-project)
    - [✨ Built With](#-built-with)
    - [🚀 Features](#-features)
  - [⚙️ Getting Started](#️-getting-started)
    - [📋 Prerequisites](#-prerequisites)
    - [💻 Installation](#-installation)
    - [🐳 Docker Setup](#-docker-setup)
    - [🔌 Database Setup (MySQL)](#-database-setup-mysql)
  - [🧪 Running Tests](#-running-tests)
  - [🎨 UI Framework](#-ui-framework)
  - [🔐 Authentication](#-authentication)
  - [📦 Database Schema](#-database-schema)
  - [📱 Deployment](#-deployment)
  - [💻 Contributing](#-contributing)
  - [📄 License](#-license)
  - [🙏 Acknowledgements](#-acknowledgements)

## 🎯 About The Project

Sistem Informasi Pengendalian Pencemaran dan Kerusakan Lingkungan Hidup (SATGAS PPKLH) merupakan sebuah platform digital untuk pengelolaan informasi terkait pengendalian pencemaran dan kerusakan lingkungan hidup. Sistem ini dirancang untuk mendukung proses pelaporan, monitoring, dan tindak lanjut terhadap kasus pencemaran dan kerusakan lingkungan.

### ✨ Built With

This full-stack application is built using modern web technologies:

- [Next.js](https://nextjs.org) - Frontend framework with server-side rendering
- [TypeScript](https://www.typescriptlang.org) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [Shadcn UI](https://ui.shadcn.com) - Re-usable components
- [Prisma ORM](https://www.prisma.io) - Next-generation Node.js and TypeScript ORM
- [MySQL](https://www.mysql.com) - Relational database management system
- [Better Auth](https://better-auth.com) - Authentication library
- [Zod](https://zod.dev) - Schema validation
- [Lucide React](https://lucide.dev) - Icon library

### 🚀 Features

- ⚡ **Fast and Responsive**: Built with Next.js 15 and TypeScript for optimal performance
- 🔐 **Authentication**: Secure authentication with Better Auth
- 📊 **Database**: MySQL database with Prisma ORM for type-safe queries
- 🎨 **UI Components**: Ready-to-use Shadcn UI components with Tailwind CSS
- 📱 **Responsive Design**: Works seamlessly on all device sizes
- 🔄 **Real-time Updates**: Support for real-time data updates
- 🛡️ **Security**: Built-in security features and best practices
- 🚀 **Deployment Ready**: Optimized for deployment on Vercel, Netlify, and other platforms

## ⚙️ Getting Started

### 📋 Prerequisites

Make sure you have the following installed on your system:

- [Node.js](https://nodejs.org/en/download/) (v18.17 or higher)
- [npm](https://www.npmjs.com/get-npm) (v9.6.7 or higher) or [Yarn](https://yarnpkg.com/getting-started/install)
- [MySQL](https://dev.mysql.com/downloads/mysql/) or [Docker](https://www.docker.com/products/docker-desktop/) for containerized database
- [Git](https://git-scm.com/downloads)

### 💻 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/YourUsername/satgas-ppk.git
   cd satgas-ppk
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory and add the required environment variables:

   ```env
   DATABASE_URL=mysql://mysqluser:mysqlpassword@localhost:3307/satgas_ppk_dev
   MYSQL_DB=satgas_ppk_dev
   MYSQL_USER=mysqluser
   MYSQL_PASSWORD=mysqlpassword
   BETTER_AUTH_SECRET=your_super_secret_key_here
   BETTER_AUTH_URL=http://localhost:3000
   NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
   ```

4. **Generate Prisma client**

   ```bash
   npx prisma generate
   ```

5. **Run database migrations**

   ```bash
   npx prisma db push
   ```

6. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

7. **Open your browser**

   Visit [http://localhost:3000](http://localhost:3000) to see the application.

### 🐳 Docker Setup

This project includes Docker support for easy setup:

1. **Start the MySQL database using Docker**

   ```bash
   npm run db:dev
   ```

2. **Verify the database is running**

   ```bash
   npm run docker:logs
   ```

### 🔌 Database Setup (MySQL)

This project uses MySQL as the database with Prisma ORM for database operations.

1. **Database Migration**

   To generate and apply database migrations:

   ```bash
   npm run db:generate
   npm run db:push
   ```

2. **Database Studio**

   To explore your database schema and data:

   ```bash
   npm run db:studio
   ```

3. **Connection String Format**

   The application uses the following MySQL connection string format:

   ```
   mysql://username:password@host:port/database
   ```

   Example:
   ```
   DATABASE_URL=mysql://mysqluser:mysqlpassword@localhost:3307/satgas_ppk_dev
   ```

## 🧪 Running Tests

This project uses Jest for testing:

1. **Run all tests**

   ```bash
   npm run test
   ```

2. **Run tests in watch mode**

   ```bash
   npm run test:watch
   ```

## 🎨 UI Framework

This project utilizes:

- [Tailwind CSS](https://tailwindcss.com) - A utility-first CSS framework
- [Shadcn UI](https://ui.shadcn.com) - Re-usable components built using Radix UI and Tailwind CSS
- [Lucide React](https://lucide.dev) - Beautifully simple, pixel-perfect icons

## 🔐 Authentication

Authentication is powered by [Better Auth](https://better-auth.com). Key features:

- Secure authentication flow
- Social login support
- Session management
- Role-based access control

## 📦 Database Schema

The project uses Prisma ORM with MySQL for database operations. The schema file is located at `prisma/schema.prisma`:

- Defines User, Account, Session, Verification models for authentication
- Defines Report model for environmental violation reports
- Defines InvestigationDocument model for investigation documents and files
- Defines Notification model for notification system

## 📱 Deployment

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Code-With-Us/codeguide-starter-fullstack&env=DATABASE_URL,BETTER_AUTH_SECRET&envDescription=Environment%20variables%20needed%20for%20deployment&envLink=link-to-env-variables-docs)

### Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Code-With-Us/codeguide-starter-fullstack)

### Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template-url)

For manual deployment:

1. Build the application:

   ```bash
   npm run build
   ```

2. Start the production server:

   ```bash
   npm start
   ```

## 💻 Contributing

We welcome contributions to this project! Here's how you can get involved:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org) - React framework
- [TypeScript](https://www.typescriptlang.org) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [Prisma ORM](https://www.prisma.io) - Next-generation Node.js and TypeScript ORM
- [Better Auth](https://better-auth.com) - Authentication library
- [Shadcn UI](https://ui.shadcn.com) - UI components
- [Vercel](https://vercel.com) - Deployment platform
- [MySQL](https://www.mysql.com) - Database