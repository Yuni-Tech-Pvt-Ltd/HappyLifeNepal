# HappyLifeNepal - Charity Website

A modern charity website for HappyLifeNepal with a public landing page and secure admin dashboard.

## Features

### Public Website
- **Hero Section**: Compelling introduction with call-to-action
- **Impact Statistics**: 260+ Children, 110+ Volunteers, 190+ Products, 560+ Donors
- **About Us**: Mission, vision, and organizational information
- **Donations**: Active donation campaigns with progress tracking
- **Events**: Upcoming charity events and activities
- **Blog**: Latest news and success stories
- **Contact Form**: Direct communication with the organization

### Admin Dashboard
- **Secure Authentication**: Login and registration for admins
- **Protected Routes**: All admin pages require authentication
- **Content Management**:
  - About Us page editing
  - Donation campaigns (add/edit/delete)
  - Events management (add/edit/delete)
  - Blog posts (add/edit/delete)
  - Contact message inbox
- **Image Storage**: Supabase storage buckets for all media
- **Dashboard Analytics**: Quick overview of content and messages

## Database Schema

You need to create these tables in Supabase:

```sql
-- About Us Table
CREATE TABLE about_us (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mission TEXT,
  vision TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donations Table
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  amount_goal NUMERIC NOT NULL,
  amount_raised NUMERIC DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events Table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blogs Table
CREATE TABLE blogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  author TEXT NOT NULL,
  image_url TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Messages Table
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Storage Buckets

Create these storage buckets in Supabase (all public):
- `about-images`
- `donation-images`
- `event-images`
- `blog-images`

## Getting Started

1. Create the database tables in Supabase
2. Create the storage buckets
3. Make sure Row Level Security (RLS) is configured appropriately
4. Create your first admin account via the registration page
5. Start managing content!

## Technologies Used

- React + TypeScript + Vite
- Tailwind CSS
- Supabase (Auth, Database, Storage)
- React Query (TanStack Query)
- React Router
- Shadcn/ui Components
