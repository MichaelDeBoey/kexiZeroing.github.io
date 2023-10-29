import React from 'react'
// May change importing a css file to using css-in-js or tailwind directly later...
import './style.css'
import Confetti from 'react-confetti'

// Inspired by https://linknode.vercel.app
const MobileMockup = () => {
  return (
    <div className="mobile__outline">
      <div className="volume volume-up"></div>
      <div className="volume volume-down"></div>
      <div className="switch" data-switch="off"></div>
      <div className="main-content">
        <Confetti
          width="320"
          height="650"
          recycle={false}
        />
        <main>
          <span className="relative flex shrink-0 h-20 w-20 rounded-full overflow-hidden mx-auto">
            <img className="aspect-square h-full w-full object-cover" alt="Kexi Dang's profile picture" src="https://avatars.githubusercontent.com/kexiZeroing" />
          </span>
          <h3 className="text-xl font-bold mt-4 text-slate-800">Hello World</h3>
          <div className="sentence-list text-sm text-slate-600">
            <p>- Patient with yourself, be forgiving with yourself.</p>
            <p>- I'm a great developer, but I still need to Google how to restart my new iPhone. I did manage to take a few screenshots of my home screen in the process.</p>
            <p>- Social media cares more about what's hot and being talked about instead of what can actually get you a job.</p>
          </div>
        </main>
      </div>
    </div>
  )
}

export default MobileMockup