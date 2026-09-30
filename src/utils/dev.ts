

export function consoleDev(data:any){
    if(process.env.NEXT_PUBLIC_MOD==="DEV"){
        console.log(data);
    }
}