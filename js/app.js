(() => {
  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => [...c.querySelectorAll(s)];
  const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));

  // Preloader
  const loader = $('#preloader');
  const loaderPercent = $('#loaderPercent');
  let lp = 0;
  const loadTimer = setInterval(() => {
    lp += Math.ceil(Math.random()*11);
    if (lp >= 100) { lp = 100; clearInterval(loadTimer); setTimeout(()=>loader.classList.add('done'), 350); }
    loaderPercent.textContent = lp + '%';
  }, 80);

  // Header + progress
  const header = $('#siteHeader');
  const progress = $('.scroll-progress span');
  const onScroll = () => {
    header.classList.toggle('scrolled', scrollY > 40);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
  };
  addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // Mobile menu
  const menuBtn = $('#menuBtn'), mobileMenu = $('#mobileMenu');
  menuBtn.addEventListener('click', () => {
    const open = !mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open', open); menuBtn.classList.toggle('active', open);
    menuBtn.setAttribute('aria-expanded', String(open)); document.body.classList.toggle('menu-open', open);
  });
  $$('#mobileMenu a').forEach(a=>a.addEventListener('click',()=>{mobileMenu.classList.remove('open');menuBtn.classList.remove('active');document.body.classList.remove('menu-open')}));

  // Cursor
  const dot = $('.cursor--dot'), ring = $('.cursor--ring');
  let mx = innerWidth/2, my = innerHeight/2, rx = mx, ry = my;
  addEventListener('pointermove', e => { mx=e.clientX; my=e.clientY; dot.style.transform=`translate(${mx}px,${my}px)`; });
  const cursorLoop=()=>{rx+=(mx-rx)*.15;ry+=(my-ry)*.15;ring.style.transform=`translate(${rx}px,${ry}px)`;requestAnimationFrame(cursorLoop)};cursorLoop();
  $$('a,button,.tilt-card').forEach(el=>{el.addEventListener('pointerenter',()=>ring.classList.add('active'));el.addEventListener('pointerleave',()=>ring.classList.remove('active'))});

  // Magnetic buttons
  $$('.magnetic').forEach(el=>{
    el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();const x=e.clientX-(r.left+r.width/2),y=e.clientY-(r.top+r.height/2);el.style.transform=`translate(${x*.13}px,${y*.13}px)`});
    el.addEventListener('pointerleave',()=>el.style.transform='translate(0,0)');
  });

  // Tilt cards
  $$('.tilt-card').forEach(card=>{
    card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(1000px) rotateX(${-y*7}deg) rotateY(${x*9}deg) translateZ(3px)`});
    card.addEventListener('pointerleave',()=>card.style.transform='');
  });

  // GSAP animation layer
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from('.hero__title .line > span',{yPercent:110,duration:1.15,stagger:.11,ease:'power4.out',delay:.5});
    gsap.from('.hero-card',{opacity:0,y:70,rotate:11,scale:.88,duration:1.4,ease:'expo.out',delay:.7});
    gsap.from('.floating-chip',{opacity:0,scale:.5,duration:.7,stagger:.12,delay:1.1,ease:'back.out(1.8)'});
    gsap.utils.toArray('.reveal-up').forEach(el=>gsap.from(el,{scrollTrigger:{trigger:el,start:'top 88%'},y:55,opacity:0,duration:1,ease:'power3.out'}));
    gsap.utils.toArray('.reveal-left').forEach(el=>gsap.from(el,{scrollTrigger:{trigger:el,start:'top 86%'},x:-70,opacity:0,duration:1.1,ease:'power3.out'}));
    gsap.utils.toArray('.split-title').forEach(el=>gsap.from(el,{scrollTrigger:{trigger:el,start:'top 88%'},y:45,opacity:0,filter:'blur(10px)',duration:1.05,ease:'power3.out'}));
    gsap.to('.portrait-frame',{scrollTrigger:{trigger:'#about',start:'top bottom',end:'bottom top',scrub:1},y:-45,rotate:1});
    gsap.to('.hero-card',{scrollTrigger:{trigger:'#home',start:'top top',end:'bottom top',scrub:1},y:110,rotate:-5,scale:.92});
    gsap.to('.showreel__stage',{scrollTrigger:{trigger:'#showreel',start:'top bottom',end:'bottom top',scrub:1},rotate:3,scale:1.06});
    gsap.to('.contact__title',{scrollTrigger:{trigger:'#contact',start:'top bottom',end:'bottom top',scrub:1},letterSpacing:'-.12em'});
    gsap.utils.toArray('.service-card').forEach((card,i)=>gsap.from(card,{scrollTrigger:{trigger:card,start:'top 92%'},opacity:0,y:35,duration:.6,delay:(i%3)*.05}));
  }

  // Counters
  const counters = $$('[data-count]');
  const io = new IntersectionObserver(entries=>entries.forEach(en=>{if(en.isIntersecting){const el=en.target,target=+el.dataset.count;let n=0;const t=setInterval(()=>{n+=Math.max(1,Math.ceil(target/30));if(n>=target){n=target;clearInterval(t)}el.textContent=n},34);io.unobserve(el)}}),{threshold:.5});
  counters.forEach(c=>io.observe(c));

  // Three.js: persistent 3D background + image/video media planes
  const mount = $('#webgl');
  if (!window.THREE || !mount) return;
  try {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05060a, 0.052);
    const camera = new THREE.PerspectiveCamera(52, innerWidth/innerHeight, .1, 100);
    camera.position.set(0,0,10.5);
    const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));
    renderer.setSize(innerWidth,innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const world = new THREE.Group(); scene.add(world);
    const mediaGroup = new THREE.Group(); world.add(mediaGroup);
    const geoGroup = new THREE.Group(); world.add(geoGroup);

    scene.add(new THREE.AmbientLight(0xffffff,.48));
    const key = new THREE.PointLight(0xc8ff45,22,26); key.position.set(4,4,6); scene.add(key);
    const cyan = new THREE.PointLight(0x55e6ff,18,24); cyan.position.set(-5,-2,5); scene.add(cyan);
    const magenta = new THREE.PointLight(0xff4fd8,12,22); magenta.position.set(1,-5,2); scene.add(magenta);

    // Particle galaxy
    const pCount = innerWidth < 700 ? 850 : 1650;
    const pos = new Float32Array(pCount*3);
    for(let i=0;i<pCount;i++){
      const r = 5 + Math.random()*13, a=Math.random()*Math.PI*2, b=Math.acos(2*Math.random()-1);
      pos[i*3]=r*Math.sin(b)*Math.cos(a); pos[i*3+1]=r*Math.sin(b)*Math.sin(a); pos[i*3+2]=r*Math.cos(b);
    }
    const pGeo = new THREE.BufferGeometry(); pGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const pts = new THREE.Points(pGeo,new THREE.PointsMaterial({color:0xaeb6ff,size:.025,transparent:true,opacity:.55,depthWrite:false}));
    world.add(pts);

    // Main abstract sculpture
    const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1.5,.28,180,24,2,5),new THREE.MeshPhysicalMaterial({color:0x1d2233,metalness:.82,roughness:.18,clearcoat:1,clearcoatRoughness:.12,wireframe:false}));
    knot.position.set(4.8,-1.2,-1.5); knot.scale.setScalar(1.08); geoGroup.add(knot);
    const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(2.2,1),new THREE.MeshBasicMaterial({color:0xc8ff45,wireframe:true,transparent:true,opacity:.16}));
    wire.position.set(-5,2,-3); geoGroup.add(wire);
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.4,.015,8,160),new THREE.MeshBasicMaterial({color:0x55e6ff,transparent:true,opacity:.27}));ring1.rotation.x=1.2;geoGroup.add(ring1);
    const ring2 = ring1.clone();ring2.scale.setScalar(.7);ring2.rotation.set(.2,1.1,.4);geoGroup.add(ring2);

    // Media planes: photo texture and video texture
    const texLoader = new THREE.TextureLoader();
    texLoader.load('assets/purushottam.jpeg', tex=>{
      tex.colorSpace = THREE.SRGBColorSpace;
      const photo = new THREE.Mesh(new THREE.PlaneGeometry(2.4,3),new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:.58,side:THREE.DoubleSide}));
      photo.position.set(-4.7,-.2,-2.2); photo.rotation.set(.06,.55,-.08); photo.name='photoPlane'; mediaGroup.add(photo);
      const frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(2.55,3.15)),new THREE.LineBasicMaterial({color:0xc8ff45,transparent:true,opacity:.35}));frame.position.copy(photo.position);frame.rotation.copy(photo.rotation);mediaGroup.add(frame);
    });
    const vid = $('#textureVideo');
    if(vid){
      const play=()=>vid.play().catch(()=>{}); play(); addEventListener('pointerdown',play,{once:true});
      const vTex = new THREE.VideoTexture(vid);vTex.colorSpace=THREE.SRGBColorSpace;vTex.minFilter=THREE.LinearFilter;vTex.magFilter=THREE.LinearFilter;
      const vm = new THREE.Mesh(new THREE.PlaneGeometry(2.4,3),new THREE.MeshBasicMaterial({map:vTex,side:THREE.DoubleSide,transparent:true,opacity:.72}));
      vm.position.set(4.7,1.5,-2.6);vm.rotation.set(-.08,-.5,.06);vm.name='videoPlane';mediaGroup.add(vm);
    }

    // Floating mini cubes
    for(let i=0;i<18;i++){
      const s=.05+Math.random()*.16;const m=new THREE.Mesh(new THREE.BoxGeometry(s,s,s),new THREE.MeshStandardMaterial({color:i%3===0?0xc8ff45:0x606b92,metalness:.6,roughness:.3}));
      m.position.set((Math.random()-.5)*15,(Math.random()-.5)*11,(Math.random()-.5)*10-2);m.rotation.set(Math.random()*3,Math.random()*3,0);m.userData.speed=.2+Math.random()*.6;world.add(m);
    }

    let pointer={x:0,y:0}, target={x:0,y:0};
    addEventListener('pointermove',e=>{target.x=(e.clientX/innerWidth-.5)*2;target.y=(e.clientY/innerHeight-.5)*2});
    let scrollNorm=0; addEventListener('scroll',()=>{scrollNorm=scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)},{passive:true});
    const clock=new THREE.Clock();
    function render(){
      const t=clock.getElapsedTime();pointer.x+=(target.x-pointer.x)*.035;pointer.y+=(target.y-pointer.y)*.035;
      camera.position.x=pointer.x*.42;camera.position.y=-pointer.y*.32;camera.lookAt(0,0,0);
      world.rotation.y=t*.018 + pointer.x*.06 + scrollNorm*.55;world.rotation.x=pointer.y*.025;
      pts.rotation.y=t*.012;pts.rotation.x=t*.006;
      knot.rotation.x=t*.18;knot.rotation.y=t*.24;wire.rotation.x=t*.07;wire.rotation.y=-t*.1;ring1.rotation.z=t*.08;ring2.rotation.z=-t*.11;
      mediaGroup.position.y=Math.sin(t*.7)*.12;mediaGroup.rotation.y=Math.sin(t*.25)*.035;
      world.children.forEach(o=>{if(o.userData&&o.userData.speed){o.rotation.x+=.004*o.userData.speed;o.rotation.y+=.006*o.userData.speed}});
      renderer.render(scene,camera);requestAnimationFrame(render)
    }render();
    addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.8))});
  } catch(err){ console.warn('Three.js scene fallback:',err); }
})();
