import {createFileRoute, useNavigate} from "@tanstack/react-router"
import {motion, useAnimate} from "framer-motion"
import {LockOpen} from "lucide-react"
import {useState} from "react"

import {Button} from "#components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "#components/ui/input-otp"
import {Spinner} from "#components/ui/spinner"
import * as api from "#services/api"
import {$authState, AuthState} from "#stores/auth"

function RouteComponent() {
  const [scope, animate] = useAnimate()
  const [totp, setTotp] = useState("")
  const [isIncorrect, setIsIncorrect] = useState(false)
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(false)
  function _redirect() {
    void navigate({
      to: new URL(window.location.href).searchParams.get("redirect") ?? "/",
      replace: true,
    })
  }
  function _shake() {
    animate(
      scope.current,
      {x: ["0px", "5px", "-5px", "5px", "0px"]},
      {duration: 0.4, ease: "easeInOut"},
    )
  }
  if ($authState.value === AuthState.AUTHENTICATED) {
    _redirect()
  }
  async function _onLoginClick() {
    if (totp.length < 6) {
      _shake()
      return
    }
    setIsIncorrect(false)
    setIsLoading(true)
    try {
      await api.login({totp})
      $authState.value = AuthState.AUTHENTICATED
      _redirect()
    } catch {
      $authState.value = AuthState.UNAUTHENTICATED
      setIsLoading(false)
      setIsIncorrect(true)
      _shake()
    }
  }
  return (
    <div className="grid h-dvh place-items-center">
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-32 items-end"></div>
        <motion.div ref={scope} className="flex items-center gap-2">
          <InputOTP maxLength={6} value={totp} onChange={setTotp} aria-invalid={isIncorrect}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <Button size="icon" onClick={() => void _onLoginClick()} disabled={isLoading}>
            {isLoading ? <Spinner /> : <LockOpen />}
          </Button>
        </motion.div>
        <div className="flex h-32">
          <h2 className="text-xs font-medium text-muted-foreground">
            Enter the code from your authenticator app
          </h2>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute("/login")({component: RouteComponent})
