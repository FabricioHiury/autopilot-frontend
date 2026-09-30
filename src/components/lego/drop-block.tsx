

import { motion, AnimatePresence } from "framer-motion";
interface Props{
    isDrop:boolean
    className:string;
    children: React.ReactNode;
}

export default function DropBlock({ isDrop, className, children }:Props){
    return (
        <AnimatePresence>
            {isDrop && (
                <motion.div
                    className={className}
                    initial={{
                        height: 0,
                        opacity: 0,
                    }}
                    animate={{
                        height: "auto",
                        opacity: 1,
                    }}
                    exit={{
                        height: 0,
                        opacity: 0,
                    }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

