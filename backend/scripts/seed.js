const mongoose = require('mongoose');
require('dotenv').config();
const Admin = require('../models/Admin');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Comment.deleteMany({});
    await Blog.deleteMany({});
    await Admin.deleteMany({});

    try {
      await mongoose.connection.db.dropCollection('users');
      console.log('Dropped legacy users collection');
    } catch (e) {
    }

    const admin = await Admin.create({
      username: 'AlexRivers',
      email: 'admin@blogverse.com',
      password: 'adminpassword123',
      role: 'admin',
    });
    console.log('Created admin in "admins" collection:', admin.email);

    const blogs = [
      {
        title: 'The Future of Full-Stack Architecture in 2026',
        description: `Modern web architecture is shifting rapidly toward edge computing, hybrid rendering, and autonomous agentic workflows.\n\nIn this deep dive, we explore how React 19, server actions, and AI-accelerated dev tools are redefining how software engineers approach modern web apps.\n\nFrom optimized bundlers to low-latency databases, the stack of tomorrow is already here. Stay curious and experiment with distributed architectures!`,
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        author: admin._id,
        likes: ['seed_user_1', 'seed_user_2', 'seed_user_3'],
        likesCount: 3,
        commentsCount: 2,
        sharesCount: 5,
      },
      {
        title: 'Crafting Next-Gen Glassmorphic UI/UX Designs',
        description: `Glassmorphism continues to captivate designers when paired with deep neon palettes and subtle micro-animations.\n\nBy leveraging CSS backdrop-filter, multi-layered radial gradients, and fluid typography, you can deliver an interface that feels alive.\n\nRemember: good aesthetics aren't just cosmetic; they foster emotional connection and delight users from their very first interaction.`,
        mediaType: 'gif',
        mediaUrl: 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
        author: admin._id,
        likes: ['seed_user_1', 'seed_user_4'],
        likesCount: 2,
        commentsCount: 1,
        sharesCount: 8,
      },
      {
        title: 'Mastering Dynamic Video & Media Streaming in Web Apps',
        description: `Handling diverse media formats seamlessly is essential for any high-engagement publication platform.\n\nWhether embedding YouTube educational walkthroughs, serving WebM/MP4 videos with custom controls, or managing animated GIFs, responsive aspect ratio containers ensure content shines on mobile and desktop alike.`,
        mediaType: 'url',
        mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        author: admin._id,
        likes: ['seed_user_2'],
        likesCount: 1,
        commentsCount: 0,
        sharesCount: 12,
      },
    ];

    const createdBlogs = await Blog.insertMany(blogs);
    console.log(`Inserted ${createdBlogs.length} sample blogs`);

    await Comment.create({
      blog: createdBlogs[0]._id,
      username: 'SarahDev',
      text: 'Insightful writeup! The shift toward edge rendering and faster pipelines has completely changed our team workflow.',
    });

    await Comment.create({
      blog: createdBlogs[0]._id,
      username: 'DevonK',
      text: 'Great breakdown. Would love to see a follow-up benchmark comparison.',
    });

    await Comment.create({
      blog: createdBlogs[1]._id,
      username: 'ElenaUI',
      text: 'The glassmorphic styling and animated accents look absolutely stunning!',
    });

    console.log('Sample comments added');
    console.log('Database seeded successfully with ADMIN model!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
