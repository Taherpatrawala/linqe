import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="text-6xl font-bold text-muted-foreground mb-4">
                        404
                    </div>
                    <CardTitle>Page Not Found</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    </p>
                    <div className="flex space-x-2">
                        <Link href="/" className="flex-1">
                            <Button className="w-full">Go Home</Button>
                        </Link>
                        <Link href="/feed" className="flex-1">
                            <Button variant="outline" className="w-full">
                                Go to Feed
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}