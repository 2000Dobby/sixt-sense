interface HeaderProps {
    step: number;
}

export default function Header({ step }: HeaderProps) {
    return (
        <div className="w-full p-4 flex justify-between items-center z-10">
            <div className="text-sixt-orange font-bold text-2xl tracking-tighter">SIXT Sense</div>
        </div>
    );
}
