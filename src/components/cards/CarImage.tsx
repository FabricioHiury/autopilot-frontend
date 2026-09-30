
import { memo } from "react";

function CarImage(){
    return(
        <div className="relative w-full h-[50%] flex flex-row items-center justify-center ">
            <img src="/images/carro.png" className="absolute w-[80%] object-contain z-20" alt=""/>
            <img src="/images/carro.png" className="absolute w-[80%] top-[50%] left-[0px] rotate-[190deg] opacity-30 -scale-x-100 object-contain z-10" alt=""/>
            <img src="/images/carro_neon.png" className="absolute blur-2xl w-[80%] object-contain z-10 animate-neonShine"  alt=""/>
        </div>
    )
}

export default memo(CarImage);