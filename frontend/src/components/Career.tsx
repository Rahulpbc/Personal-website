import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Solutions Specialist</h4>
                <h5>Deloitte</h5>
              </div>
              <h3>2021</h3>
            </div>
            <p>
              Designed and developed distributed backend microservices in hybrid cloud environments (GCP, AWS, Azure), reducing latency and improving system reliability by 15%.
              Built streaming data pipelines and real-time backend services using Java (Spring Boot), Kafka, and AWS Lambda for low-latency fraud detection and data ingestion.
              Collaborated with platform and data engineering teams to optimize distributed workflows for consistency, throughput, and resilience.
              Integrated observability tooling (Prometheus, Grafana, custom metrics) to monitor backend service health, latency, and scaling.
              Led containerization and orchestration of backend services using Docker and Kubernetes, deploying to multi-cloud environments with CI/CD automation (Terraform, GitHub Actions).
              Enhanced backend notification systems for real-time customer communication.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Senior Solutions Specialist</h4>
                <h5>Deloitte</h5>
              </div>
              <h3>NOW</h3>
            </div>
            <p>
              Engineered distributed backend systems to support compliance-sensitive data pipelines using Kafka Streams and AWS SQS.
              Led refactoring of legacy monoliths into cloud-native backend microservices on Kubernetes, reducing release times and improving maintainability.
              Partnered with infrastructure and ML/data teams to build high-throughput streaming and production data pipelines.
              Supported real-time model decisioning systems (fraud detection & anti-money laundering) and enhanced backend observability pipelines for better debugging and live analysis.
              Collaborated with cross-functional teams to design and deploy scalable backend services supporting sensitive and privacy-centric data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;