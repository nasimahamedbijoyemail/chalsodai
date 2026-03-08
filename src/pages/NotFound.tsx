import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PageHead from "@/components/PageHead";

const NotFound = () => {
  return (
    <div className="container py-20 text-center">
      <PageHead title="পেজ পাওয়া যায়নি" />
      <h1 className="text-6xl font-bold text-primary mb-4">৪০৪</h1>
      <p className="text-xl text-muted-foreground mb-6">দুঃখিত! পেজটি পাওয়া যায়নি</p>
      <Button asChild>
        <Link to="/">হোমে ফিরুন</Link>
      </Button>
    </div>
  );
};

export default NotFound;
