# Travel Booking Form - Itinerary Quotation

A comprehensive full-stack web application for collecting travel booking information with n8n webhook integration. Built with React, TypeScript, Express.js, and shadcn/ui components.

## Features

### 📋 Comprehensive Form
- **Travel Dates**: Date picker with validation
- **Meal Preferences**: Toggle for meal inclusion
- **Flight Information**: Detailed flight details textarea
- **Tour Includes/Excludes**: Dynamic lists with preset items and custom additions
- **File Upload**: Support for PDF, DOC, DOCX, XLSX, and Markdown files
- **Language Selection**: English, Mandarin, or custom language preference

### 🔧 Technical Features
- **Real-time Validation**: Form validation using Zod schemas
- **n8n Integration**: Automatic webhook forwarding for workflow automation
- **Responsive Design**: Mobile-friendly interface with dark mode support
- **Accessibility**: Full ARIA compliance and keyboard navigation
- **File Handling**: Drag-and-drop upload with size limits and type validation
- **Type Safety**: Full TypeScript implementation throughout

### 🚀 Modern Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js, Node.js
- **UI Components**: shadcn/ui built on Radix UI primitives
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: TanStack React Query for server state
- **Icons**: Lucide React icons

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd travel-booking-form
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file
   touch .env
   
   # Add your n8n webhook URL (optional)
   echo "N8N_WEBHOOK_URL=https://your-n8n-instance.app/webhook/your-webhook-id" >> .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5000`

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and configurations
│   │   └── hooks/         # Custom React hooks
├── server/                # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   └── vite.ts           # Vite integration for development
├── shared/               # Shared code between client and server
│   └── schema.ts         # Zod validation schemas
├── docs/                 # Documentation
│   ├── n8n-webhook-integration.md
│   └── deployment-guide.md
└── dist/                 # Production build output
```

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `N8N_WEBHOOK_URL` | n8n webhook endpoint for form submissions | No | - |
| `NODE_ENV` | Environment mode | No | `development` |
| `PORT` | Server port | No | `5000` |

### Form Configuration

The form includes several preset items that can be customized:

**Tour Includes (Preset Items):**
- Return International air fare + airport taxes + fuel surcharges + 20kg checked luggage
- Stay 05 Night as per itinerary based on twin / triple sharing
- Private touring in A/C coach with local Mandarin speaking guide as per itinerary
- Meals as per itinerary
- Tipping of tour guide & driver
- Travel Insurance (for age above 69 years old, require to top up RM108)
- 01 tour leader service

**Tour Excludes (Preset Items):**
- Hotel Portage in/out luggage
- Other expenses which are not indicated in itinerary

Users can remove preset items and add custom items as needed.

## Usage

### Basic Form Submission

1. **Fill out the form** with travel details
2. **Upload required documents** (PDF, DOC, DOCX, XLSX, MD)
3. **Select language preference** (English, Mandarin, or custom)
4. **Customize includes/excludes** by removing presets or adding custom items
5. **Submit the form** - data is validated and sent to n8n (if configured)

### File Upload Guidelines

- **Supported formats**: PDF, DOC, DOCX, XLSX, Markdown
- **Size limit**: Configurable (default enforcement via frontend)
- **Upload methods**: Drag-and-drop or click to browse
- **Validation**: File type and size validation before upload

### n8n Integration

When a webhook URL is configured, form submissions are automatically forwarded to your n8n workflow. The JSON payload includes:

```json
{
  "starting_date": "2024-12-25",
  "meals_provided": true,
  "flight_information": "Flight details...",
  "tour_fair_includes": ["item1", "item2"],
  "tour_fair_excludes": ["item1", "item2"],
  "uploaded_file": {
    "filename": "document.pdf",
    "size": 245760,
    "type": "application/pdf",
    "data": "base64-encoded-content..."
  },
  "file_size_limit_enabled": true,
  "itinerary_language": "English"
}
```

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run check` | Run TypeScript type checking |

### Development Workflow

1. **Frontend development**: Edit files in `client/src/`
2. **Backend development**: Edit files in `server/`
3. **Shared types**: Update schemas in `shared/schema.ts`
4. **Hot reload**: Changes automatically reload in development mode

### Code Style

- **TypeScript**: Strict mode enabled throughout
- **ESLint**: Code linting with recommended rules
- **Prettier**: Consistent code formatting
- **Import organization**: Absolute imports using `@/` prefix

## Deployment

Multiple deployment options are available:

### Option 1: Replit Publishing (Easiest)
1. Click "Publish" in your Replit workspace
2. Configure environment variables
3. Optionally set up custom domain

### Option 2: Independent Hosting

**Recommended Platforms:**
- **Render**: Great for full-stack Node.js apps
- **Railway**: Excellent for Docker-based deployment
- **Vercel**: Not recommended for this architecture
- **VPS**: For advanced users who want full control

**Build Process:**
```bash
npm install
npm run build  # Builds both frontend and server
npm start      # Starts production server
```

See [Deployment Guide](docs/deployment-guide.md) for detailed instructions.

## n8n Workflow Integration

This application is designed to integrate seamlessly with n8n automation workflows. Common use cases include:

- **Lead Management**: Automatically create CRM entries
- **Email Notifications**: Send confirmations and alerts
- **File Processing**: Store uploaded documents in cloud storage
- **Multi-channel Communication**: Send SMS, WhatsApp, or Slack notifications
- **Database Integration**: Store form data in various databases

See [n8n Integration Guide](docs/n8n-webhook-integration.md) for detailed setup instructions.

## Security

### Production Considerations

- **Environment Variables**: All secrets stored securely
- **File Upload Security**: Type and size validation
- **HTTPS**: SSL certificates for production deployments
- **Input Validation**: Client and server-side validation
- **Error Handling**: Graceful error handling without data leakage

### Security Checklist

- [ ] Environment variables configured
- [ ] n8n webhook URLs protected
- [ ] HTTPS enabled for production
- [ ] File upload validation enabled
- [ ] Error tracking implemented
- [ ] Log access secured

## Troubleshooting

### Common Issues

**Form not submitting:**
- Check browser console for validation errors
- Verify all required fields are filled
- Ensure file upload meets size/type requirements

**n8n webhook not receiving data:**
- Verify `N8N_WEBHOOK_URL` environment variable is set
- Check n8n workflow is activated
- Review server logs for webhook errors

**Build failures:**
- Ensure Node.js 18+ is installed
- Clear node_modules and reinstall dependencies
- Check for TypeScript compilation errors

**File upload issues:**
- Verify supported file types (PDF, DOC, DOCX, XLSX, MD)
- Check file size limits
- Ensure browser supports drag-and-drop

### Debug Mode

Enable detailed logging by setting:
```bash
NODE_ENV=development
```

This provides verbose console output for debugging.

## Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards

- Follow TypeScript strict mode
- Use existing component patterns
- Add proper TypeScript types
- Include error handling
- Test form validation scenarios

## Browser Support

- **Modern browsers**: Chrome 90+, Firefox 88+, Safari 14+
- **Mobile browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Features used**: ES2020, CSS Grid, Flexbox
- **Accessibility**: WCAG 2.1 AA compliant

## Performance

- **Bundle size**: Optimized with Vite code splitting
- **Loading time**: Fast initial load with lazy loading
- **File handling**: Efficient base64 encoding for uploads
- **Caching**: Static asset caching in production
- **API**: Optimized REST endpoints with validation

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

For technical support or questions:

1. Check the [documentation](docs/) for common solutions
2. Review [troubleshooting](#troubleshooting) section
3. Check existing GitHub issues
4. Create a new issue with detailed information

## Changelog

### v1.0.0
- Initial release with full form functionality
- n8n webhook integration
- File upload support for multiple formats
- Responsive design with dark mode
- Comprehensive accessibility features
- Production-ready deployment options