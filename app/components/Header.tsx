interface HeaderProps {
    step: number;
}

export default function Header({ step }: HeaderProps) {
    return (
        <div className="w-full p-4 flex justify-between items-center z-10">
            <div className="text-sixt-orange font-bold text-2xl tracking-tighter">SIXT Sense</div>
            <div className="text-sm text-gray-400">
                {step === 1 && "Welcome"}
                {step === 2 && "Your Vehicle"}
                {step === 3 && "Locate Vehicle"}
                {step === 4 && "Unlock"}
            </div>
        </div>
    );
}
