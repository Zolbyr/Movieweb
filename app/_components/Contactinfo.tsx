export const ContactInfo = () => {
  return (
    <footer className="w-full bg-indigo-700 mt-10">
      <div className="max-w-screen-2xl mx-auto px-6 py-10 grid grid-cols-4 gap-8 text-white">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span>🎬</span>
            <span className="font-bold text-lg">Movie Z</span>
          </div>
          <p className="text-sm text-indigo-200 leading-relaxed">
          © 2026 Movie Z. All Rights Reserved.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Contact information</h4>
          <ul className="space-y-2 text-sm text-indigo-200">
          <p className="text-sm text-indigo-200 leading-relaxed">
           Phone: +976 (11) 123-4567
          </p>
                    <p className="text-sm text-indigo-200 leading-relaxed">
          Email:
          support@movieZ.com
          </p>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Legal</h4>
          <ul className="space-y-2 text-sm text-indigo-200">
            <li className="hover:text-white cursor-pointer transition">Terms of Use</li>
            <li className="hover:text-white cursor-pointer transition">Privacy Policy</li>
            <li className="hover:text-white cursor-pointer transition">Cookie Policy</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Contact</h4>
          <ul className="space-y-2 text-sm text-indigo-200">
            <li className="hover:text-white cursor-pointer transition">About Us</li>
            <li className="hover:text-white cursor-pointer transition">Careers</li>
            <li className="hover:text-white cursor-pointer transition">Support</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-indigo-600">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex justify-between text-xs text-indigo-300">
          <span>© 2026 Movie Z. All Rights Reserved.</span>
        </div>
      </div>
    </footer>
  );
};