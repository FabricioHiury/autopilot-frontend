import { useRef } from "react"

interface props{
    accept?: string
    onImageUpload: (file:File) => void
}

const ImageInput : React.FC<props> = ({accept="image/*",onImageUpload})=>{

    const inputImage = useRef<HTMLInputElement>(null)

    interface CustomFile extends File {
        imageUrl?: string;
    }

    function handleFileClick(event:any){
        inputImage.current?.showPicker();
    }

    function handleFileChange(event:any){
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0] as CustomFile;

        if (file) {
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
                if (e.target) {
                    file.imageUrl = e.target.result as string; 
                }
                onImageUpload(file)
            };
            reader.readAsDataURL(file);
        }

        input.value = '';

    }

    return(
        <div className="flex flex-colum justify-center z-40 cursor-pointer top-0 left-0 w-full h-full absolute overflow-hidden" onClick={handleFileClick}>
            <input className="hidden" type="file" ref={inputImage} accept={accept} onChange={handleFileChange}/>
        </div>
    )
}

export default ImageInput