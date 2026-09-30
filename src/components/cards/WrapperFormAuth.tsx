import React, { memo } from "react";

interface WrapperFormAuthProps {
  children: React.ReactNode; 
}

const WrapperFormAuth: React.FC<WrapperFormAuthProps> = ({ children }) => {
    return(
        <div className="bg-[#F2F4F7] lg:bg-[#161A21] w-full lg:w-1/2 flex flex-col px-4 items-center lg:items-stretch justify-start h-screen lg:flex-none overflow-hidden min-h-0">
            <div className="flex flex-col gap-6 w-full lg:w-full bg-[#F2F4F7] px-4 py-6 lg:px-16 lg:py-14 rounded-none lg:rounded-xl h-full overflow-y-auto">
                {children}
            </div>
        </div>
    )
};

export default memo(WrapperFormAuth);
    