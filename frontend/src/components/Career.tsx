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
              Designed and developed scalable full-stack applications and distributed microservices in hybrid cloud environments (GCP, AWS, Azure), reducing latency and improving system reliability by 15%.
              Developed microservices and streaming pipelines using Java (Spring Boot), Kafka, and AWS Lambda, enabling low-latency fraud detection and data ingestion at scale.
              Worked closely with platform and data teams to optimize distributed workflows for consistency, throughput, and resilience.
              Integrated observability tooling with Prometheus, Grafana, and custom metrics to monitor service health, latency, and scaling.
              Led the containerization and orchestration of services using Docker and Kubernetes, deploying to multi-cloud environments with CI/CD automation via Terraform and GitHub Actions..
              Upgraded real-time prescription notification system, significantly improving customer communication and experience
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
              Developed distributed systems to support compliance-sensitive data pipelines using Kafka Streams and AWS SQS.
              Led the efforts in refactoring legacy monolithic systems into cloud-native microservices on Kubernetes, reducing release times and improving maintainability.
              Partnered with infrastructure and ML-adjacent teams to build streaming capabilities and production data pipelines.
              Supported real-time model decisioning systems (fraud detection &  anti-money laundering)  and enhanced observability pipelines for better debugging and live analysis.
              Collaborated with cross-functional teams to design and deploy scalable services supporting sensitive data, including privacy-centric data pipelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;