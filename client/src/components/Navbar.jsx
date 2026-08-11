import React from "react";
import { useState } from "react";


const Navbar = () => {

    const [selectedTheme, setSelectedTheme] = useState("light")


    const handleThemeChange = (e) => {
        setSelectedTheme(e.target.value)
        document.documentElement.setAttribute("data-theme", e.target.value)
    }

  return (
    <>
      <nav className="bg-primary w-full flex items-center justify-between">
        <div className="flex justify-between items-center w-full h-15">
          <h2 className="text-primary-content font-bold text-lg">VibeChat</h2>
          <div>
            {/* create select flyonui theme dropdown */}
            <select
              label="theme"
              name="theme"
              id="theme"
              className="select select-rounded"
              onChange={handleThemeChange}
            >
              <option value="light">light</option>
              <option value="dark">dark</option>
              <option value="black">black</option>
              <option value="claude">claude</option>
              <option value="corporate">corporate</option>
              <option value="ghibli">ghibli</option>
              <option value="gourmet">gourmet</option>
              <option value="luxury">luxury</option>
              <option value="mintlify">mintlify</option>
              <option value="pastel">pastel</option>
              <option value="perplexity">perplexity</option>
              <option value="shadcn">shadcn</option>
              <option value="slack">slack</option>
              <option value="soft">soft</option>
              <option value="spotify">spotify</option>
              <option value="valorant">valorant</option>
              <option value="vscode">vscode</option>
            </select>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
