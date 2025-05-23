# Periskope Clone

A modern chat application built with Next.js, TypeScript, and Supabase, featuring real-time messaging, group chats, and a beautiful UI.

![Periskope Clone](https://media.licdn.com/dms/image/v2/D4E0BAQEi-Cj3qTHuAg/company-logo_200_200/company-logo_200_200/0/1692600818066?e=2147483647&v=beta&t=3wx49OFHJagynkawPHEG1a8NkmC8k4pUNeCZyXGTuRY)

## 🌟 Features

- 🔐 Secure authentication with magic link
- 💬 Real-time messaging
- 👥 Group chat support
- 🎨 Modern and responsive UI
- 📱 Mobile-friendly design
- ⚡ Real-time typing indicators
- 🔍 Message search functionality
- 📱 Video and voice call support (UI ready)

## 🚀 Live Demo

Check out the live application: [Periskope Clone](https://periskopeclone.web.app/)

## 📹 Video Demo

Watch the application in action: [Video Demo](https://drive.google.com/file/d/1keQLhw4wqJ1rdC6UAPahMzWlZXvY3ZYN/view?usp=sharing)

## 🛠️ Tech Stack

- **Frontend:**
  - Next.js 13
  - TypeScript
  - Tailwind CSS
  - Redux Toolkit
  - React Icons

- **Backend:**
  - Supabase
  - PostgreSQL
  - Real-time subscriptions

## 🏗️ Project Structure

```
src/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/             # Utility functions and configurations
│   ├── store/       # Redux store and slices
│   └── supabase/    # Supabase client and helpers
└── types/           # TypeScript type definitions
```

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/periskope-clone.git
   cd periskope-clone
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with the following variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Set up the following tables:
   - users
   - conversations
   - messages
   - typing_status
3. Enable real-time subscriptions for messages and typing status

## 📱 Features in Detail

### Authentication
- Magic link authentication
- Secure session management
- Automatic redirect after login

### Chat Features
- Real-time message updates
- Message history
- Typing indicators
- Group chat support
- Message timestamps
- User avatars

### UI/UX
- Responsive design
- Dark/light mode support
- Modern and clean interface
- Smooth animations
- Loading states

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Icons](https://react-icons.github.io/react-icons/)
