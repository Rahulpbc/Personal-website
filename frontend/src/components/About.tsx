import "./styles/About.css";

const About = () => {
  return (
    <div className="about-section" id="about">
      <div className="about-me">
        <h3 className="title">About Me</h3>
        <p className="para">
          Hi, I'm Rahul Choudhary, a backend-focused software engineer with over 4 years of experience designing and scaling distributed systems in cloud-native environments. I specialize in building high-performance, resilient backend infrastructure using technologies like Java, Python, Kafka, Kubernetes, and AWS/GCP.

          I’ve led projects across real-time data pipelines, fraud detection systems, and cloud microservices—working at the intersection of infrastructure, reliability, and developer experience. I enjoy solving complex systems challenges and collaborating with cross-functional teams to deliver scalable, impactful products.

          Currently, I'm focused on building infrastructure that powers AI-driven applications and high-throughput platforms.
        </p>
      </div>
    </div>
  );
};

export default About;