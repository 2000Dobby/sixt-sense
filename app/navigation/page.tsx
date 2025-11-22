import HeadingArrow from './_components/heading-arrow';
import Minimap from './_components/minimap';

export default function Navigation() {
    const targetPosition: [number, number] = [48.2624679, 11.6688545];

    return (
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold" style={{ color: "#FF5F00" }}>Head to your car</h1>
            <HeadingArrow targetAngle={0} />
            <div style={{ marginTop: '20px' }}>
                <Minimap targetPoint={targetPosition} />
            </div>
        </div>
    );
}