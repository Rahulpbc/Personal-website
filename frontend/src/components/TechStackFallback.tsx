import React from 'react';
import './styles/TechStackFallback.css';

const TechStackFallback: React.FC = () => {
  const technologies = [
    { name: 'React', image: '/images/react.png' },
    { name: 'Java', image: '/images/java.png' },
    { name: 'Python', image: '/images/python.png' },
    { name: 'Express', image: '/images/express.png' },
    { name: 'PostgreSQL', image: '/images/postgresql.png' },
    { name: 'MySQL', image: '/images/mysql.png' },
    { name: 'TypeScript', image: '/images/typescript.png' },
    { name: 'JavaScript', image: '/images/javascript.png' },
    { name: 'AWS', image: '/images/aws.png' },
    { name: 'Azure', image: '/images/azure.png' },
    { name: 'Docker', image: '/images/docker.png' },
    { name: 'Kubernetes', image: '/images/kubernetes.png' },
    { name: 'Prometheus', image: '/images/prometheus.png' },
    { name: 'Grafana', image: '/images/grafana.png' },
    { name: 'Redis', image: '/images/redis.png' },
  ];

  return (
    <div className="tech-stack-fallback" id="tech-stack-fallback">
      <h2>My Tech Stack</h2>
      <div className="tech-grid">
        {technologies.map((tech, index) => (
          <div className="tech-item" key={index}>
            <div className="tech-logo-container">
              <img 
                src={tech.image} 
                alt={`${tech.name} logo`} 
                className="tech-logo"
                onError={(e) => {
                  console.error(`Failed to load image: ${tech.image}`);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <p className="tech-name">{tech.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechStackFallback;
