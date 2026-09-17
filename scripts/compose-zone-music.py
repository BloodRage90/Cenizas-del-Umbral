from pathlib import Path
import numpy as np, wave, subprocess, shutil
root=Path('/workspace/sites/cenizas-del-umbral'); (root/'scripts').mkdir(exist_ok=True)
# Original, deterministic chamber-like sketches. No sampled or third-party melodies.
sr=22050; dur=48; N=sr*dur
zones={'plaza':(62,[0,4,7,9,7,4,2,0],.65),'taller':(50,[0,7,3,10,7,3,2,7],.45),'criptas':(45,[0,1,7,3,0,6,3,1],.18),'bosque':(57,[0,3,7,10,9,7,3,2],.4),'lindero':(60,[0,7,9,4,2,7,4,0],.55),'embarcadero':(55,[0,4,9,7,4,2,0,7],.65),'molino':(50,[0,3,2,7,0,10,7,2],.28),'monasterio':(48,[0,7,3,2,7,10,3,0],.24),'archivo':(53,[0,2,3,7,5,3,2,0],.35),'enfermeria':(60,[0,4,7,4,9,7,2,0],.75),'capilla':(46,[0,7,1,3,7,6,3,0],.22)}
def hz(m):return 440*2**((m-69)/12)
for z,(base,motif,warm) in zones.items():
 out=np.zeros((N,2),dtype=np.float64)
 def note(start,length,midi,gain,plucked=False,pan=.5):
  n=int(length*sr); t=np.arange(n)/sr; f=hz(midi)
  if plucked: y=(np.sin(2*np.pi*f*t)+.28*np.sin(2*np.pi*f*2*t)+.09*np.sin(2*np.pi*f*3*t))*np.exp(-t*1.4)*np.minimum(t/.025,1)
  else: y=(np.sin(2*np.pi*f*t)+.23*np.sin(2*np.pi*f*2.002*t)+.11*np.sin(2*np.pi*f*3*t))*np.minimum(t/.8,1)*np.minimum((length-t)/1.3,1)*(.94+.06*np.sin(2*np.pi*4*t))
  a=int(start*sr);b=min(N,a+n);y=y[:b-a]*gain;out[a:b,0]+=y*(1-pan*.5);out[a:b,1]+=y*(.5+pan*.5)
 for bar in range(8):
  chord=[0,5,3,7][(bar//2)%4];third=4 if warm>.5 else 3
  for j,interval in enumerate([0,third,7]):note(bar*6,6,base-12+chord+interval,.065,False,j/2)
  for beat in range(4):
   idx=(bar*4+beat)%len(motif);note(bar*6+beat*1.5,3,base+12+motif[idx],.105,True,(idx%3)/2)
  note(bar*6,5.9,base-24+chord,.075)
 # Quiet stereo reflections, gentle boundary fade to avoid loop clicks.
 for delay,gain in [(int(.23*sr),.17),(int(.47*sr),.09)]:out[delay:]+=out[:-delay,::-1]*gain
 fade=np.minimum(np.arange(N)/(sr*1.5),1)*np.minimum((N-1-np.arange(N))/(sr*2),1);out*=fade[:,None]
 out=np.tanh(out*1.2)*.75
 tmp=Path('/tmp')/(z+'.wav')
 with wave.open(str(tmp),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes((out*32767).astype('<i2').tobytes())
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(tmp),'-codec:a','libmp3lame','-b:a','96k',str(root/'dist/music'/f'{z}.mp3')],check=True)
 print(z,flush=True)
shutil.copy2(__file__,root/'scripts/compose-zone-music.py')
