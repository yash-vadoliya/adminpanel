import React from "react";
import { ShieldCheck, MapPin, Armchair, Users, Zap, Clock } from "lucide-react";
import "./FeaturesPage.css";

const features = [
  {
    title: "Smart Bus Search",
    description:
      "Find buses instantly by route, date, boarding point, and drop location with powerful filtering options.",
    icon: <Zap size={32} />,
  },
  {
    title: "Live Seat Availability",
    description:
      "View real-time seat layouts and choose your preferred seat with instant booking confirmation.",
    icon: <Armchair size={32} />,
  },
  {
    title: "Real-Time Bus Tracking",
    description:
      "Track your bus location live and get accurate arrival updates for a stress-free journey.",
    icon: <MapPin size={32} />,
  },
  {
    title: "Secure Online Payments",
    description:
      "Multiple payment options including UPI, Credit/Debit Cards, and Net Banking with encrypted transactions.",
    icon: <ShieldCheck size={32} />,
  },
  {
    title: "Easy Cancellations & Refunds",
    description:
      "Hassle-free ticket cancellations with transparent refund policies and instant processing.",
    icon: <Clock size={32} />,
  },
  {
    title: "User Dashboard",
    description:
      "Manage bookings, download tickets, view travel history, and update profile details in one place.",
    icon: <Users size={32} />,
  },
];


const FeaturesPage = () => {
  return (
    <div className="features-page py-5">

      <div className="container text-center mb-5">
        <h6 className="text-primary fw-bold text-uppercase">
          Core Capabilities
        </h6>
        <h1 className="fw-bold display-5">
          Everything you need to manage travel
        </h1>
        <p className="text-muted fs-5">
          Built with the MERN stack for speed, security, and scalability.
        </p>
      </div>

      <div className="container">
        <div className="row g-4">
          {features.map((feature, index) => (
            <div className="col-md-6 col-lg-4" key={index}>
              <div className="feature-card p-4 text-center">
                <div className="icon-wrapper mb-3">
                  {feature.icon}
                </div>
                <h4 className="fw-bold mb-3">{feature.title}</h4>
                <p className="text-muted">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Section */}
      <div className="container mt-5">
        <div className="tech-section text-center p-5">
          <h3 className="fw-bold mb-3">Powered by Silver Lines</h3>
          {/* <p className="mb-4">React.js • Node.js • Express.js • MySQL</p> */}
          <button className="btn btn-light px-4 py-2 fw-bold" >
            <a href="https://www.silverlines.in/">
              View Website
            </a>
          </button>
        </div>
      </div>

    </div>
  );
};

export default FeaturesPage;
