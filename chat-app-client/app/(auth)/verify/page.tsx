import Loading from "@/app/components/Loading";
import VerifyOTP from "@/app/components/VerifyOTP";
import {Suspense} from "react";

const VerifyPage = () => {
  return (
    <div>
      <Suspense fallback={<Loading></Loading>}>
        <VerifyOTP></VerifyOTP>
      </Suspense>
    </div>
  );
};

export default VerifyPage;
