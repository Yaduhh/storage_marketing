import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  HardDrive, 
  Upload, 
  Folder, 
  Shield, 
  Zap, 
  Users, 
  Globe, 
  CheckCircle,
  ArrowRight,
  Star,
  FileText,
  Image as ImageIcon,
  Video,
  Archive
} from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    const features = [
        {
            icon: <HardDrive className="h-8 w-8" />,
            title: "Global File Access",
            description: "Access and manage files from all users in one centralized location"
        },
        {
            icon: <Upload className="h-8 w-8" />,
            title: "Easy Upload",
            description: "Drag and drop files with support for all file types up to 1GB"
        },
        {
            icon: <Folder className="h-8 w-8" />,
            title: "Smart Organization",
            description: "Create folders, move files, and organize your content efficiently"
        },
        {
            icon: <Shield className="h-8 w-8" />,
            title: "Secure Storage",
            description: "Your files are safely stored with enterprise-grade security"
        },
        {
            icon: <Zap className="h-8 w-8" />,
            title: "Lightning Fast",
            description: "Optimized for speed with instant file previews and downloads"
        },
        {
            icon: <Users className="h-8 w-8" />,
            title: "Collaborative",
            description: "Share and collaborate on files with team members seamlessly"
        }
    ];

    const fileTypes = [
        { icon: <ImageIcon className="h-6 w-6" />, name: "Images", count: "JPG, PNG, GIF, WebP" },
        { icon: <Video className="h-6 w-6" />, name: "Videos", count: "MP4, AVI, MOV, WebM" },
        { icon: <FileText className="h-6 w-6" />, name: "Documents", count: "PDF, DOC, TXT, XLS" },
        { icon: <Archive className="h-6 w-6" />, name: "Archives", count: "ZIP, RAR, 7Z" }
    ];

    return (
        <>
            <Head title="File Manager - Global File Storage Solution">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=inter:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>
            
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                {/* Navigation */}
                <nav className="border-b border-slate-200/60 bg-white/80 backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/80">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                                    <HardDrive className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-slate-900 dark:text-white">
                                    FileManager
                                </span>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                {auth.user ? (
                                    <>
                                        <Button variant="ghost" asChild>
                                            <Link href={register()}>
                                                Create New User
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button asChild>
                                            <Link href={dashboard()}>
                                                <Globe className="mr-2 h-4 w-4" />
                                                Dashboard
                                            </Link>
                                        </Button>
                                    </>
                                ) : (
                                    <Button asChild>
                                        <Link href={login()}>Sign In</Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative overflow-hidden py-20 sm:py-32">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <Badge variant="secondary" className="mb-6">
                                <Star className="mr-1 h-3 w-3" />
                                Global File Management Platform
                            </Badge>
                            
                            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
                                {auth.user ? "Welcome Back!" : "Sign In to Access"}
                                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    {" "}Global Files
                                </span>
                            </h1>
                            
                            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                                {auth.user 
                                    ? "Access, organize, and collaborate on files from all users. Create new user accounts or manage existing files."
                                    : "Sign in to access our global file management platform. Only authorized users can create new accounts."
                                }
                            </p>
                            
                            <div className="mt-10 flex items-center justify-center gap-x-6">
                                {!auth.user && (
                                    <Button size="lg" asChild>
                                        <Link href={login()}>
                                            Sign In to Access
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                )}
                                {auth.user && (
                                    <>
                                        <Button variant="outline" size="lg" asChild>
                                            <Link href={register()}>
                                                Create New User
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button size="lg" asChild>
                                            <Link href={dashboard()}>
                                                <Globe className="mr-2 h-4 w-4" />
                                                Access Global Files
                                            </Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 sm:py-32">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                                Powerful Features
                            </h2>
                            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                                Everything you need to manage files efficiently
                            </p>
                        </div>
                        
                        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature, index) => (
                                <Card key={index} className="border-slate-200/60 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 dark:border-slate-700/60 dark:bg-slate-800/60 dark:hover:bg-slate-800/80">
                                    <CardHeader>
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                            {feature.icon}
                                        </div>
                                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-base">
                                            {feature.description}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* File Types Section */}
                <section className="py-20 sm:py-32 bg-white/50 dark:bg-slate-800/50">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                                Supported File Types
                            </h2>
                            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                                Upload and manage any type of file
                            </p>
                        </div>
                        
                        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {fileTypes.map((type, index) => (
                                <Card key={index} className="text-center border-slate-200/60 bg-white/60 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/60">
                                    <CardContent className="pt-6">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                            {type.icon}
                                        </div>
                                        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                                            {type.name}
                                        </h3>
                                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                            {type.count}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-20 sm:py-32">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                                Trusted by Teams Worldwide
                            </h2>
                            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                                Join thousands of users managing their files globally
                            </p>
                        </div>
                        
                        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                                    10K+
                                </div>
                                <div className="mt-2 text-lg text-slate-600 dark:text-slate-300">
                                    Files Managed
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                                    1TB+
                                </div>
                                <div className="mt-2 text-lg text-slate-600 dark:text-slate-300">
                                    Storage Used
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                                    99.9%
                                </div>
                                <div className="mt-2 text-lg text-slate-600 dark:text-slate-300">
                                    Uptime
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 sm:py-32 bg-gradient-to-r from-blue-600 to-indigo-600">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                Ready to Get Started?
                            </h2>
                            <p className="mt-4 text-lg text-blue-100">
                                Join our global file management platform today
                            </p>
                            
                            <div className="mt-10 flex items-center justify-center gap-x-6">
                                {!auth.user && (
                                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
                                        <Link href={login()}>
                                            Sign In to Access
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                )}
                                {auth.user && (
                                    <>
                                        <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
                                            <Link href={register()}>
                                                Create New User
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button size="lg" variant="secondary" asChild>
                                            <Link href={dashboard()}>
                                                <Globe className="mr-2 h-4 w-4" />
                                                Access Dashboard
                                            </Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-slate-200/60 bg-white/80 backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/80">
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                                    <HardDrive className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-lg font-semibold text-slate-900 dark:text-white">
                                    FileManager
                                </span>
                            </div>
                            
                            <div className="text-sm text-slate-600 dark:text-slate-300">
                                © 2024 FileManager. All rights reserved.
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
