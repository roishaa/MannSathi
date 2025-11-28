function Home() {
  return (
    <div className="min-h-screen bg-[#fffff] px-6 py-10">

      {/* NAVBAR */}
      <header className="flex items-center justify-between">
        {/* Left Logo Ribbon */}
        {/* Logo ribbon */}
        <div className="relative">
         {/* green shape */}
        <div className="w-56 h-16 bg-[#215c4c] [clip-path:polygon(0_0,100%_0,100%_60%,50%_100%,0_60%)]" />
  
        {/* centered text */}
        <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white font-semibold text-xl font-serif tracking-wide">
            MannSathi
        </span>
        </div>
</div>

        {/* NAV LINKS */}
        <nav className="flex items-center gap-10 text-[15px] font-medium text-neutral-800">
          <a className="hover:text-[#215c4c] cursor-pointer">Home</a>
          <a className="hover:text-[#215c4c] cursor-pointer">About Us</a>
          <a className="hover:text-[#215c4c] cursor-pointer">Services</a>

          {/* Search icon */}
          <div className="h-9 w-9 flex items-center justify-center rounded-full bg-white border shadow hover:shadow-md cursor-pointer">
            🔍
          </div>
        </nav>
      </header>

  
{/* HERO SECTION */}
<section className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-10 items-center px-4">

  {/* LEFT TEXT AREA */}
  <div className="ml-10">   {/* ← small shift only */}
    
    {/* pastel chips */}
    <div className="flex gap-4 mb-6">
      <div className="h-3 w-16 rounded-full bg-[#f7d8dd]" />
      <div className="h-3 w-16 rounded-full bg-[#f7e7a6]" />
    </div>

    {/* MAIN TEXT (bigger + cleaner) */}
    <p className="text-[24px] leading-[1.65] text-neutral-900 font-medium">
      Your <span className="font-bold">Mental health</span> is just <br />
      as important as <br />
      your physical health, <br />
      take care of both.
    </p>

    {/* wavyline */}
 <div className="mt-4">
  {/* Wavy line with shadow */}
  <svg
    className="w-60"    // make longer (you can change to w-72, w-80, etc.)
    height="20"
    viewBox="0 0 300 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      {/* soft shadow filter */}
      <filter id="wavyShadow" x="-20" y="-20" width="400" height="80">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#c8b7a7" floodOpacity="0.5"/>
      </filter>
    </defs>

    <path
      d="M0 10 
         Q 40 0 80 10 
         T 160 10 
         T 240 10 
         T 320 10"
      stroke="#d2c3b4"
      strokeWidth="4"
      strokeLinecap="round"
      filter="url(#wavyShadow)"   // apply shadow
    />
  </svg>
</div>


    {/* Buttons row */}
<div className="mt-6 flex gap-4">
  {/* Book Appointment */}
  <button className="inline-flex items-center rounded-full border border-[#89ad8f] bg-[#e3f3e6] px-8 py-3 text-[16px] font-semibold text-[#305b39] shadow-[0_4px_0_0_#89ad8f] hover:translate-y-[1px] hover:shadow-[0_3px_0_0_#89ad8f] transition">
    Book Appointment
  </button>

  {/* Login button – same style, slightly lighter */}
 <button
  onClick={() => (window.location.href = "/login")}
  className="inline-flex items-center rounded-full border border-[#89ad8f] bg-[#e3f3e6] px-8 py-3 text-[16px] font-semibold text-[#305b39] shadow-[0_4px_0_0_#89ad8f] hover:translate-y-[1px] hover:shadow-[0_3px_0_0_#89ad8f] transition"
>
  Login
</button>
</div>

  </div>

{/* RIGHT ILLUSTRATION */}
<div className="flex justify-center md:justify-start ml-4">
  <div className="relative">

    {/* Outer white oval */}
    <div className="h-72 w-80 rounded-[50%] bg-white flex items-center justify-center shadow-sm">
      
      {/* Inner peach oval */}
      <div className="h-64 w-72 rounded-[50%] bg-[#ffe1d6] flex items-center justify-center overflow-hidden">

        {/* Avatar */}
        <img
          src="/src/assets/avatar1.jpg"
          alt="Avatar"
          className="h-full w-full object-contain bg-white"
        />
      </div>
    </div>

  </div>
</div>


</section>


<section className="mt-24">
  <div className="overflow-x-auto scrollbar-hide pl-12"> 
    {/* pl-12 → pushes the whole card row to the RIGHT */}
    
    <div className="flex gap-10 snap-x snap-mandatory">

      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="snap-center min-w-[310px] bg-[#ffe5d6] rounded-xl border border-[#f3ccb3] shadow-lg"
        >

          {/* Titles */}
          <div className="flex justify-between items-start px-6 pt-6">
            <div>
              <p className="font-semibold text-lg text-neutral-900">
                Anger Management
              </p>
              <p className="text-sm text-neutral-600 mt-1">
                Improve communication
              </p>
            </div>

            {/* Status indicator */}
            <div className="h-7 w-7 flex items-center justify-center bg-white shadow rounded-full mt-1">
              <div className="h-3.5 w-3.5 rounded-full bg-[#24c5a7]" />
            </div>
          </div>

          {/* Image */}
          <img
            src="/src/assets/avatar2.jpg"
            className="mt-5 w-full h-72 object-cover rounded-b-xl"
            alt="therapy"
          />

        </div>
      ))}

    </div>
  </div>
</section>
{/* EMOTIONAL CHECK-IN SECTION */}
<section className="mt-20 mb-24 flex flex-col items-center gap-10 px-4">
  {/* Top CTA bar */}
  <button
    className="w-full max-w-xl flex items-center justify-between rounded-md border border-[#2c7365] bg-[#5fb1a0] px-6 py-3 text-sm font-semibold text-[#0d1b1a] shadow-[0_6px_0_0_rgba(33,92,76,0.8)] hover:translate-y-[1px] hover:shadow-[0_4px_0_0_rgba(33,92,76,0.8)] transition"
  >
    <span>Find out what’s really on your mind</span>
    <span className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#0d1b1a] text-xs text-white">
      ?
    </span>
  </button>

  {/* Main content */}
  <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
    {/* LEFT IMAGE BLOCK */}
    <div className="relative flex justify-center md:justify-start">
      {/* square placeholder (replace with your own image if you want) */}
      <div className="h-64 w-56 rounded-md border border-[#f0e6d8] bg-[url('/path-to-your-texture.png')] bg-cover bg-center bg-[#f8f4ec]" />
      {/* overlapping circle */}
      <div className="absolute -bottom-10 left-10 h-32 w-32 rounded-full bg-[#dedede]" />
    </div>

    {/* RIGHT TEXT BLOCK */}
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        {/* vertical line */}
        <div className="w-[2px] bg-[#c4b9aa] mt-1" />
        <p className="text-sm leading-relaxed text-neutral-800 max-w-sm">
          Feeling lost or overwhelmed? <br />
          <span className="font-semibold">MannSathi</span> helps you check in with
          your emotions, talk to experts, and find peace of mind.
        </p>
      </div>

      <button className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 hover:gap-3 transition">
        Explore
        <span className="text-lg leading-none">›</span>
      </button>
    </div>
  </div>
</section>


    </div>
  );
}

export default Home;
