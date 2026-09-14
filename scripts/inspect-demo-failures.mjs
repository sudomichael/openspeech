process.loadEnvFile('.env');
const response=await fetch('https://api.replicate.com/v1/predictions',{headers:{Authorization:`Bearer ${process.env.REPLICATE_API_TOKEN}`}});const body=await response.json();
for(const prediction of (body.results??[]).filter(p=>p.model==='lucataco/orpheus-3b-0.1-ft').slice(0,3))console.log(JSON.stringify({id:prediction.id,status:prediction.status,error:prediction.error,metrics:prediction.metrics,created:prediction.created_at,completed:prediction.completed_at}));
