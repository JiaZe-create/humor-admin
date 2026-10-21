export const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function parseMedia(form:FormData) {
 const text=(key:string)=>String(form.get(key)??'').trim();
 const value={scene:text('scene'),prompt:text('prompt'),style:text('style'),model:text('model'),status:text('status'),caption:text('caption')||null};
 if(value.scene.length<10||value.scene.length>500)throw new Error('Scene must contain 10–500 characters.');
 if(value.prompt.length<10||value.prompt.length>6000)throw new Error('Prompt must contain 10–6,000 characters.');
 if(!['dry','chaotic','wholesome'].includes(value.style))throw new Error('Choose a valid tone.');
 if(!value.model||value.model.length>160)throw new Error('Enter the source AI model (up to 160 characters).');
 if(!['pending','complete','failed'].includes(value.status))throw new Error('Choose a valid status.');
 if((value.caption?.length??0)>400||(value.status==='complete'&&!value.caption))throw new Error('Completed media needs a caption of 1–400 characters.');
 return value;
}
