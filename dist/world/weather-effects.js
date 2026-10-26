export const weatherLabel = weather => ({ sunny: '晴天', rainy: '雨天', foggy: '迷霧' }[weather] || weather);
const wrap = (value, size) => ((value % size) + size) % size;

// Pure rendering: seconds for time, scene pixels for dimensions and light positions.
// This never advances world clocks, rolls weather or changes saved state.
export function drawAtmosphere(ctx, { width, height, time, state, lights = [], nightOpacity = .62 }) {
  ctx.save();
  try {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(12,24,55,${state.darkness * nightOpacity})`;
    ctx.fillRect(0,0,width,height);
    if(state.weather==='rainy'){
      ctx.fillStyle='#263e5540';ctx.fillRect(0,0,width,height);
    }
    ctx.globalCompositeOperation='screen';
    for(const {x,y,radius,strength=.6} of lights){
      if(radius<=0)continue;
      const glow=ctx.createRadialGradient(x,y,0,x,y,radius);
      glow.addColorStop(0,`rgba(255,200,95,${state.darkness*strength})`);
      glow.addColorStop(1,'rgba(255,192,96,0)');
      ctx.fillStyle=glow;ctx.fillRect(x-radius,y-radius,radius*2,radius*2);
    }
    ctx.globalCompositeOperation='source-over';
    const scale=width/960;
    if(state.weather==='rainy'){
      const count=Math.max(60,Math.round(width*height/3400));
      ctx.strokeStyle='#c3deeb80';ctx.lineWidth=Math.max(.6,scale);ctx.beginPath();
      for(let i=0;i<count;i++){
        const x=wrap(i*137-time*45*scale,width+40)-20,y=wrap(i*71+time*320*scale,height+40)-20;
        ctx.moveTo(x,y);ctx.lineTo(x-4*scale,y+11*scale);
      }
      ctx.stroke();
      for(let i=0;i<18;i++){
        const phase=wrap(time+i*.17,1),x=wrap(i*173+67,width),y=height*.45+wrap(i*79,height*.5);
        ctx.strokeStyle=`rgba(200,223,220,${(1-phase)*.35})`;ctx.beginPath();
        ctx.ellipse(x,y,(2+phase*6)*scale,(1+phase*2)*scale,0,0,Math.PI*2);ctx.stroke();
      }
    }else if(state.weather==='foggy'){
      const night=state.darkness;
      ctx.fillStyle=`rgba(167,190,182,${.15-night*.04})`;ctx.fillRect(0,0,width,height);
      // Wide drifting banks with soft edges leave buildings and hit targets visible.
      for(let i=0;i<8;i++){
        const x=wrap(i*width*.23+time*(5+i%3),width*1.6)-width*.3;
        const y=height*(.13+(i%4)*.24)+Math.sin(time*.12+i)*height*.025;
        const radius=width*(.3+(i%3)*.045);
        ctx.save();ctx.translate(x,y);ctx.scale(1,.34);
        const fog=ctx.createRadialGradient(0,0,0,0,0,radius);
        fog.addColorStop(0,`rgba(194,211,201,${.21-night*.06})`);
        fog.addColorStop(1,'rgba(194,211,201,0)');ctx.fillStyle=fog;
        ctx.fillRect(-radius,-radius,radius*2,radius*2);ctx.restore();
      }
    }
  } finally { ctx.restore(); }
}
