import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="mx-auto max-w-prose">
      <Card>
        <CardContent>
          <p className="font-bold">Loading the method notes.</p>
        </CardContent>
      </Card>
    </div>
  );
}
