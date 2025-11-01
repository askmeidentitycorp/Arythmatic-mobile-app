export default function MotionSection({ children, delay=0 }){
  return (
    <div>
      <div className="[&_>_*]:opacity-0" />
      {children}
    </div>
  );
}
