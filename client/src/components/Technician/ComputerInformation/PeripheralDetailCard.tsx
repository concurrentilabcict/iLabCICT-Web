
type peripheralProps = {
    peripheralInformation: {
        type: string,
        value: string
    }[],
    name: string
}


export default function PeripheralDetailCard({peripheralInformation, name}: peripheralProps){
    return(
            <>
                <div className="bg-white flex flex-col gap-y-2.5 border primary-border-color
                rounded-2xl p-3.5 w-full max-w-[600px] md:max-w-[550px]">

                    <span className="text-md font-semibold">{name}</span>

                    {peripheralInformation?.map((p, idx)=>(
                          <div key={idx}>
                            <div className="flex justify-between mx-1">
                                <span className="secondary-text-color text-sm">{p.type}</span>

                                {idx === peripheralInformation.length - 1 ? (

                                <span className="text-sm bg-[#DBEAFE] p-1 rounded-md text-[#3B82F6] font-medium">{p.value}</span>
                                ) :  
                                (<span className="text-sm">{p.value}</span>) }

                            </div>
                            {idx !== peripheralInformation.length - 1 &&(<div className="border-t primary-border-color my-1.5"></div>)}
                        
                        </div>
                    ))}

                </div>
            </>
        );
}