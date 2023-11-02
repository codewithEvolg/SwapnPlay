import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage, responsive, placeholder } from "@cloudinary/react";
import './App.scss';

import About from './components/About';
import Profile from './components/Profile';
import Toy from './components/Toy';
import NotFound from './components/NotFound';
import NewToy from './components/NewToy';
import ToyList from "./components/ToyList";
import UserProfile from './components/UserProfile';
import Home from './components/Home';
import TopNavigationBar from "./components/TopNavigationBar";
import Chat from './components/Chat';

const theme = createTheme({
  palette: {
    primary: {
      main: "#007bff",
    },
  },
});

function App() {
  const [filterData, setFilterData] = useState(null);
  const [subId, setSubId] = useState(null);
  
  //set cloudinary config states
  const [publicId, setPublicId] = useState("");
  const [cloudName] = useState("dhbnibaze");
  const [uploadPreset] = useState("huv2jz5e");


  const [uwConfig] = useState({
    cloudName,
    uploadPreset
  });

  // Create a Cloudinary instance and set your cloud name.
  const cld = new Cloudinary({
    cloud: {
      cloudName
    }
  });

  const myImage = cld.image(publicId);

  // To update the filterData state
  const updateFilterData = (data) => {
    setFilterData(data);
  };

  // Function to receive the subId from LoginButton
  const handleSubIdChange = (newSubId) => {
    setSubId(newSubId);
  };

  return (
    <div className="App">
      <Router>
        <TopNavigationBar onSubIdChange={handleSubIdChange} subId={subId?.sub} nickname={subId?.nickname} />
        <ThemeProvider theme={theme}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/userprofile" element={<UserProfile subId={subId?.sub} uwConfig={uwConfig} setPublicId={setPublicId}/>} />
            <Route path="/toys/:id" element={<Toy />} />
            <Route path="/toys/new" element={<NewToy />} />
            <Route path="/toys" element={<ToyList subId={subId?.sub} />} />
            <Route path="/chat/:userId" element={<Chat />} />
            <Route path="*" element={<NotFound />} />
            {/* <Route path="/upload" element={} /> */}
          </Routes>
        </ThemeProvider>
        {/* <div style={{ width: "800px" }}>
          <AdvancedImage
            style={{ maxWidth: "100%" }}
            cldImg={myImage}
            plugins={[responsive(), placeholder()]}
          />
        </div> */}
      </Router>
    </div>
  );
}

export default App;
