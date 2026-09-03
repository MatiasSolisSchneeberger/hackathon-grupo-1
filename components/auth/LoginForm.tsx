"use client"

import React, {useActionState, useState} from "react"
import Link from "next/link"
import {iniciarSesion} from "@/app/auth/actions"
import {Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {Building2, LogIn, Mail, Lock} from "lucide-react"

export const LoginForm: React.FC = () => {
	const [state, formAction, isPending] = useActionState(iniciarSesion, {})
	const [email, setEmail] = useState("")

	return (
		<div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
			<Card className="w-full max-w-md border-t-4 border-t-blue-600 shadow-xl bg-white dark:bg-zinc-900">
				<CardHeader className="text-center pb-2">
					<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold text-2xl shadow-lg mb-2">
						<Building2 className="h-8 w-8" />
					</div>
					<CardTitle className="text-2xl font-extrabold tracking-tight">Acceso a RefugIA</CardTitle>
					<CardDescription>Sistema de Gestión de Refugios & Asistencia Social</CardDescription>
				</CardHeader>

				<CardContent className="space-y-5 pt-2">
					{state.error && (
						<div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400">
							{state.error}
						</div>
					)}

					<form action={formAction} className="space-y-4">
						<div>
							<label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
								Correo Electrónico
							</label>
							<div className="relative">
								<Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
								<Input
									type="email"
									name="email"
									placeholder="ejemplo@refugia.org"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="pl-9"
									required
									disabled={isPending}
								/>
							</div>
						</div>

						<div>
							<label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Contraseña</label>
							<div className="relative">
								<Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
								<Input
									type="password"
									name="password"
									placeholder="••••••••"
									className="pl-9"
									required
									disabled={isPending}
								/>
							</div>
						</div>

						<Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5">
							<LogIn className="h-4 w-4 mr-2" />
							{isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
						</Button>
					</form>
				</CardContent>

				<CardFooter className="flex justify-center border-t border-zinc-100 dark:border-zinc-800 py-3 text-xs">
					<span className="text-zinc-500">¿No tienes cuenta?</span>
					<Link href="/registro" className="ml-1.5 font-bold text-blue-600 hover:underline dark:text-blue-400">
						Registrarse aquí
					</Link>
				</CardFooter>
			</Card>
		</div>
	)
}
