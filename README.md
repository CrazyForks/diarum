# Diaria

A simple, elegant, and self-hosted diary application built with Go, PocketBase, and SvelteKit.

## Features

- **Minimal Design**: Focus on writing with a clean, distraction-free interface
- **Markdown Support**: Write with Milkdown WYSIWYG editor
- **Calendar Navigation**: Easily navigate between dates
- **Search**: Full-text search across all your entries
- **Self-Hosted**: Complete control over your data
- **Privacy First**: Your diary, your data, your server

## Tech Stack

### Backend
- **Go**: High-performance backend
- **PocketBase**: Embedded database and authentication
- **SQLite**: Lightweight database

### Frontend
- **SvelteKit**: Modern, fast frontend framework
- **Tailwind CSS**: Utility-first CSS framework
- **Milkdown**: WYSIWYG Markdown editor

## Quick Start

### Prerequisites

- Go 1.21 or higher
- Node.js 20 or higher
- Make (optional, for convenience)

### Development

1. Clone the repository:
```bash
git clone https://github.com/songtianlun/diaria.git
cd diaria
```

2. Install dependencies:
```bash
make deps
```

3. Run backend (in one terminal):
```bash
make dev-backend
```

4. Run frontend (in another terminal):
```bash
make dev-frontend
```

5. Open http://localhost:5173 in your browser

### Build

Build both frontend and backend:
```bash
make build
```

Run the built application:
```bash
make run
```

The application will be available at http://localhost:8090

## Docker Deployment

Coming soon!

## Project Structure

```
Diaria/
├── diaria.go           # Version constants
├── main.go             # Application entry point
├── internal/           # Internal packages
│   ├── migrations/     # Database migrations
│   └── api/            # Custom API endpoints
├── site/               # Frontend (SvelteKit)
│   ├── src/
│   │   ├── lib/        # Shared libraries
│   │   └── routes/     # Pages
│   └── package.json
├── pb_data/            # PocketBase data (generated)
├── Makefile           # Build commands
└── README.md
```

## Development Roadmap

### V1 - MVP (Current)
- [x] User authentication
- [x] Basic diary CRUD
- [x] Markdown editor
- [ ] Calendar navigation
- [ ] Search functionality

### V2 - Enhanced Features
- [ ] Tags system
- [ ] Mood and weather tracking
- [ ] Image upload
- [ ] "On this day" feature

### V3 - AI Integration
- [ ] AI-powered summaries
- [ ] Emotional analysis
- [ ] Data export

## API Documentation

### Authentication
```
POST /api/collections/users/auth-with-password
```

### Custom Endpoints
```
GET  /api/diaries/by-date/:date     # Get diary by date
GET  /api/diaries/exists            # Check which dates have entries
GET  /api/diaries/search?q=keyword  # Search diaries
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Author

songtianlun

## Acknowledgments

- [PocketBase](https://pocketbase.io/) - Amazing backend framework
- [SvelteKit](https://kit.svelte.dev/) - Excellent frontend framework
- [Milkdown](https://milkdown.dev/) - Beautiful Markdown editor
- [beszel](https://github.com/henrygd/beszel) - Project structure inspiration
