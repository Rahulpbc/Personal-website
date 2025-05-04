# Personal Portfolio Website

A modern, interactive personal portfolio website built with React, TypeScript, and Three.js. This project showcases my skills, projects, and professional experience with an engaging 3D interface and responsive design.

## 🚀 Features

- **Interactive 3D Character Model**: Custom 3D character that responds to user interaction using Three.js
- **Dynamic Tech Stack Display**: 3D visualization of technology skills with interactive spheres
- **Responsive Design**: Seamlessly adapts to desktop and mobile devices
- **GSAP Animations**: Smooth scrolling animations and transitions
- **Modern UI**: Clean, professional interface with custom cursor and intuitive navigation
- **Fallback Components**: Graceful degradation for devices that can't handle 3D rendering

## 🛠️ Technologies

### Frontend
- React 18
- TypeScript
- Vite (Build tool)
- Three.js (3D rendering)
- React Three Fiber
- GSAP (Animations)
- CSS3 with custom animations

### 3D Assets
- Custom GLB model
- DRACO compression for optimized 3D assets

## 📋 Project Structure

```
frontend/
├── public/            # Static assets
│   ├── images/        # Logo images and static graphics
│   ├── models/        # 3D models (GLB files)
│   └── draco/         # DRACO decoder for 3D model compression
├── src/
│   ├── components/    # React components
│   │   ├── character/ # 3D character model components
│   │   └── styles/    # Component-specific styles
│   ├── context/       # React context providers
│   └── utils/         # Utility functions and GSAP animations
└── package.json       # Dependencies and scripts
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/Personal-website.git
   cd Personal-website
   ```

2. Install dependencies
   ```bash
   cd frontend
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## 🌐 Deployment

This project is configured for deployment on Vercel or similar platforms.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

