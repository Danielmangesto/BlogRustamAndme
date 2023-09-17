import React, { useRef } from 'react';
import { Parallax, ParallaxLayer } from '@react-spring/parallax';
import {Box} from "@mui/system";

const url = (name, wrap = false) =>
  `${wrap ? 'url(' : ''}https://awv3node-homepage.surge.sh/build/assets/${name}.svg${wrap ? ')' : ''}`;

export default function App() {
  const parallax = useRef(null);

  return (
    <div className="aboutUs" >
    <div className="aboutUs" style={{ width: '100%', height: '100%', background: '#253237' }}>
      <Parallax ref={parallax} pages={3}>
        <ParallaxLayer offset={1} speed={1} style={{ backgroundColor: '#805E73' }} />
        <ParallaxLayer offset={2} speed={1} style={{ backgroundColor: '#87BCDE' }} />

        <ParallaxLayer
          offset={0}
          speed={0}
          factor={3}
          style={{
            backgroundImage: url('stars', true),
            backgroundSize: 'cover',
          }}
        />

        <ParallaxLayer offset={1.3} speed={-0.3} style={{ pointerEvents: 'none' }}>
          <img src={url('satellite4')} style={{ width: '15%', marginLeft: '70%' }} />
        </ParallaxLayer>

        <ParallaxLayer offset={1} speed={0.8} style={{ opacity: 0.1 }}>
          <img src={url('cloud')} style={{ display: 'block', width: '20%', marginLeft: '55%' }} />
          <img src={url('cloud')} style={{ display: 'block', width: '10%', marginLeft: '15%' }} />
        </ParallaxLayer>

        <ParallaxLayer offset={1.75} speed={0.5} style={{ opacity: 0.1 }}>
          <img src={url('cloud')} style={{ display: 'block', width: '20%', marginLeft: '70%' }} />
          <img src={url('cloud')} style={{ display: 'block', width: '20%', marginLeft: '40%' }} />
        </ParallaxLayer>

        <ParallaxLayer offset={1} speed={0.2} style={{ opacity: 0.2 }}>
          <img src={url('cloud')} style={{ display: 'block', width: '10%', marginLeft: '10%' }} />
          <img src={url('cloud')} style={{ display: 'block', width: '20%', marginLeft: '75%' }} />
        </ParallaxLayer>

        <ParallaxLayer offset={1.6} speed={-0.1} style={{ opacity: 0.4 }}>
          <img src={url('cloud')} style={{ display: 'block', width: '20%', marginLeft: '60%' }} />
          <img src={url('cloud')} style={{ display: 'block', width: '25%', marginLeft: '30%' }} />
          <img src={url('cloud')} style={{ display: 'block', width: '10%', marginLeft: '80%' }} />
        </ParallaxLayer>

        <ParallaxLayer offset={2.6} speed={0.4} style={{ opacity: 0.6 }}>
          <img src={url('cloud')} style={{ display: 'block', width: '20%', marginLeft: '5%' }} />
          <img src={url('cloud')} style={{ display: 'block', width: '15%', marginLeft: '75%' }} />
        </ParallaxLayer>

        <ParallaxLayer
          offset={2.5}
          speed={-0.4}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}>
          <img src={url('earth')} style={{ width: '60%' }} />
        </ParallaxLayer>

        <ParallaxLayer
          offset={2}
          speed={-0.3}
          style={{
            backgroundSize: '80%',
            backgroundPosition: 'center',
            backgroundImage: url('clients', true),
          }}
        />

        <ParallaxLayer
          offset={0}
          speed={0.1}
          onClick={() => parallax.current.scrollTo(1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Box style={{ width: '50%', marginLeft: '0%' }}>
                <div className="profile-content">
                    <h1 style={{color:"whitesmoke"}}>Hey, welcome to our website!</h1>
                    <h2 style={{color:"whitesmoke"}}>My name is Daniel Mangesto.
                        I'm 27 years old, a former officer and currently student at the Richeman
                        University also known as the 'idc-center'. My hobbies are running and drawing.
                        I've always been liked computers and programming and that's what lead me to sign for the Bsc in
                        computer science.
                        In my years as programmer I've been learning a lot of languages such as:
                        Java, Python, C, C#, Javascript and more, but my special skills
                        are in Python and C#.
                        I'm highly motivated student, have management experience, creativity and fast learning skills.
                    </h2>
                </div>
            </Box>
        </ParallaxLayer>

        <ParallaxLayer
          offset={1}
          speed={0.1}
          onClick={() => parallax.current.scrollTo(2)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Box style={{ width: '50%', marginLeft: '0%' }}>
                <div id="aboutMe" style={{ width: '100%', height: '100%' }}>
        <header id="header">
        <h1 style={{color:"whitesmoke"}}>About Rustam:</h1>
        <h3 style={{color:"whitesmoke"}}>I am 26 years old. I did "aliya" before 10 years from Russia,</h3>
        <h3 style={{color:"whitesmoke"}}>when I was 15 years old, from city Chita(actually many people from </h3>
        <h3 style={{color:"whitesmoke"}}>Russia didn't hear that name of this city). So I studied in bording school(pnimiya)</h3>
        <h3 style={{color:"whitesmoke"}}> Atid Raziel. There I learned to speek hebrew and improved my english and found many </h3>
        <h3 style={{color:"whitesmoke"}}>good friends, and we renting now apartments in Herzlia together, also. After school I </h3>
        <h3 style={{color:"whitesmoke"}}> did army, in military service near Maale Efraim. And now I am here third year in Raichman</h3>
        <h3 style={{color:"whitesmoke"}}> University :D'</h3>
        <h3 style={{color:"whitesmoke"}}>This is the place i lived my first 15 years</h3>
        <div className="containerMap">
            <iframe id ="maps" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d157041.26868689313!2d113.33530977371377!3d52.047505012892145!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1
            !3m3!1m2!1s0x5dca351539f218ed%3A0x76432ffaf2ae72d8!2z0KfQuNGC0LAsINCX0LDQ
            sdCw0LnQutCw0LvRjNGB0LrQuNC5INC60YDQsNC5LCDQoNC-0YHRgdC40Y8!5e0!3m2!1sru
            !2sil!4v1673880314783!5m2!1sru!2sil"
                    width="100%" height="100%" allowFullScreen="" loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade">
            </iframe>
        </div>
    </header>
    </div>
            </Box>

        </ParallaxLayer>

        <ParallaxLayer
          offset={2}
          speed={-0}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => parallax.current.scrollTo(0)}>
          <img src={url('clients-main')} style={{ width: '40%' }} />
        </ParallaxLayer>
      </Parallax>
    </div>
    </div>
  );
}
