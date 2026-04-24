"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { listProjects } from "@/lib/firebase/firestore";
import type { SavedProject } from "@/types/project";

export function ProjectLibraryPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("updated");
  const [projects, setProjects] = useState<SavedProject[]>([]);

  useEffect(() => {
    if (!user) {
      return;
    }

    void listProjects(user.uid).then(setProjects);
  }, [user]);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const visibleProjects = projects.filter((project) =>
      project.title.toLowerCase().includes(normalizedQuery)
    );

    return visibleProjects.sort((left, right) => {
      if (sortBy === "title") {
        return left.title.localeCompare(right.title);
      }

      return right.updatedAt.localeCompare(left.updatedAt);
    });
  }, [projects, query, sortBy]);

  return (
    <div className="space-y-8 px-6 py-8 lg:px-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Badge variant="info" className="w-fit">
            Project Library
          </Badge>
          <h2 className="font-[family-name:var(--font-heading)] text-4xl font-semibold text-foreground">
            Search, sort, and reopen saved topologies.
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            This page becomes your shared archive of topology experiments, lab submissions, and production-ready practice networks.
          </p>
        </div>
        <div className="grid w-full max-w-xl gap-3 sm:grid-cols-[1fr_180px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-10" placeholder="Search projects" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Recently updated</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Ready for persistent project history</CardTitle>
          <CardDescription>
            Save a topology from the simulator and it appears here with filtering, sorting, and resume actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 py-10">
          {filteredProjects.length > 0 ? (
            <div className="grid gap-4">
              {filteredProjects.map((project) => (
                <div key={project.id} className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">{project.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {project.topology.devices.length} devices / {project.topology.links.length} links / updated{" "}
                      {new Date(project.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <Button asChild>
                    <Link href={`/simulator?project=${project.id}`}>
                      Resume project
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] border border-primary/20 bg-primary/10 text-primary shadow-glow">
                <ArrowRight className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">
                  Your first saved project will appear here
                </h3>
                <p className="text-muted-foreground">
                  Start in the simulator, build a topology, and save it to your library.
                </p>
              </div>
              <Button asChild>
                <Link href="/simulator">Create a new topology</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
