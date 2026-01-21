"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { Sport } from "@/types/database";
import { Calendar, Users, MapPin } from "lucide-react";

interface SportCardProps {
  sport: Sport & {
    applicable_fees?: number;
    can_register?: boolean;
    register_reason?: string;
    spots_remaining?: number | null;
  };
}

const categoryGradients = {
  indoor: "from-purple-500 to-pink-500",
  outdoor: "from-green-500 to-emerald-500",
  esports: "from-blue-500 to-cyan-500",
  athletics: "from-orange-500 to-amber-500",
};

const defaultImages = {
  indoor: "/images/sports/indoor-default.jpg",
  outdoor: "/images/sports/outdoor-default.jpg",
  esports: "/images/sports/esports-default.jpg",
  athletics: "/images/sports/athletics-default.jpg",
};

export function SportCard({ sport }: SportCardProps) {
  const isOpen = sport.is_registration_open;
  const isFull =
    sport.max_participants !== null &&
    sport.current_participants >= sport.max_participants;
  const hasWaitlist = sport.waitlist_enabled && isFull;
  const fee = sport.applicable_fees || sport.fees;
  const hasEarlyBird =
    sport.early_bird_fees !== null &&
    sport.early_bird_deadline &&
    new Date(sport.early_bird_deadline) > new Date();

  const getStatusBadge = () => {
    if (!isOpen) {
      return <Badge variant="cancelled">Closed</Badge>;
    }
    if (hasWaitlist) {
      return <Badge variant="waitlist">Waitlist</Badge>;
    }
    if (isFull) {
      return <Badge variant="cancelled">Full</Badge>;
    }
    return <Badge variant="confirmed">Open</Badge>;
  };

  const getButtonContent = () => {
    if (!isOpen) {
      return { text: "Registration Closed", disabled: true };
    }
    if (hasWaitlist) {
      return { text: "Join Waitlist", disabled: false };
    }
    if (isFull) {
      return { text: "Sport is Full", disabled: true };
    }
    return { text: `Register Now`, disabled: false };
  };

  const buttonConfig = getButtonContent();

  return (
    <Card hover className="overflow-hidden group">
      {/* Image Section */}
      <div className="relative aspect-sport-card overflow-hidden">
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-80",
            categoryGradients[sport.category]
          )}
        />
        {sport.image_url ? (
          <Image
            src={sport.image_url}
            alt={sport.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white/80 text-6xl font-bold">
              {sport.sport_code}
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">{getStatusBadge()}</div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant={sport.category} className="capitalize">
            {sport.category}
          </Badge>
        </div>

        {/* Early Bird Banner */}
        {hasEarlyBird && isOpen && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-primary to-primary-500 text-white text-xs py-1.5 px-3 text-center">
            Early Bird: {formatCurrency(sport.early_bird_fees!)} (Save{" "}
            {formatCurrency(sport.fees - sport.early_bird_fees!)})
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{sport.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {sport.description || `Join the ${sport.name} competition!`}
          </p>
        </div>

        {/* Info Row */}
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          {sport.is_team_event && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>
                {sport.team_size_min === sport.team_size_max
                  ? sport.team_size_min
                  : `${sport.team_size_min}-${sport.team_size_max}`}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(sport.registration_deadline)}</span>
          </div>
          {sport.venue && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="truncate max-w-[100px]">{sport.venue}</span>
            </div>
          )}
        </div>

        {/* Capacity Bar */}
        {sport.max_participants && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Spots filled</span>
              <span className="font-medium">
                {sport.current_participants}/{sport.max_participants}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isFull ? "bg-red-500" : "bg-primary"
                )}
                style={{
                  width: `${Math.min(
                    (sport.current_participants / sport.max_participants) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(fee)}
            </span>
            {hasEarlyBird && (
              <span className="text-sm text-muted-foreground line-through ml-2">
                {formatCurrency(sport.fees)}
              </span>
            )}
          </div>
          <Link href={`/sports/${sport.slug}`}>
            <Button
              size="sm"
              variant={buttonConfig.disabled ? "outline" : "default"}
              disabled={buttonConfig.disabled}
            >
              {buttonConfig.text}
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
