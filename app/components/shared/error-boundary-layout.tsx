import {
    isRouteErrorResponse,
    useRouteError
} from "@remix-run/react";
import {
    Card,
    CardHeader,
    CardContent,
    CardDescription,
    CardTitle
} from "../ui/card";
import crashImg from '../../assets/icons8-dead-64.png';

export default function ErrorBoundaryLayout() {
    const error = useRouteError();

    if (isRouteErrorResponse(error)) {
        return (
          <Card className="border-red-500 bg-red-100 text-black">
              <CardHeader>
                  <img src={crashImg} alt="System Crash" className="w-24 h-24 mx-auto mb-8" />
                  <CardTitle className="text-center">
                      Uh oh...
                  </CardTitle>
                  <CardDescription className="text-gray-900 text-center">
                      {error.status} - {error.statusText}
                  </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                  {error.data}
              </CardContent>
          </Card>
        );
      }
  
      return (
          <Card className="border-red-500 bg-red-100 text-black">
              <CardHeader>
                  <img src={crashImg} alt="System Crash" className="w-24 h-24 mx-auto mb-8" />
                  <CardTitle className="text-center">
                      Uh oh...
                  </CardTitle>
                  <CardDescription className="text-gray-900 text-center">
                      Unknown Error
                  </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                  { error instanceof Error ? error.message : 'An unkonw error occurred. Please try again later.'}
              </CardContent>
          </Card>
      );
}