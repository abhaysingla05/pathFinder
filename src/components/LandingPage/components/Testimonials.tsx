export default function Testimonials() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              name: "Sarah Chen",
              role: "Web Developer",
              text: "This platform helped me structure my learning journey perfectly."
            },
            {
              name: "Mike Johnson",
              role: "Data Scientist",
              text: "The AI-powered recommendations were spot-on for my needs."
            },
            {
              name: "Lisa Park",
              role: "UX Designer",
              text: "A great tool for anyone looking to break into tech."
            }
          ].map((testimonial) => (
            <div key={testimonial.name} className="bg-white p-6 rounded-lg shadow">
              <p className="mb-4">"{testimonial.text}"</p>
              <div>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-gray-600">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
