"use client";

import { useState } from "react";
import {
  ArrowSquareOut,
  Buildings,
  CaretDown,
  Gear,
  Question,
  ShieldCheck,
  SignOut,
} from "@phosphor-icons/react";
import type { Workspace } from "../lib/demo-data";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "../src/components/ui/sidebar";

export type SidebarIcon = typeof Buildings;

export type SidebarItem = {
  id: string;
  label: string;
  icon: SidebarIcon;
};

type DealerSyncSidebarProps = {
  workspace: Workspace;
  nav: SidebarItem[];
  view: string;
  exceptionCount: number;
  onNavigate: (view: string) => void;
  onWorkspaceChange: (workspace: Workspace) => void;
};

export default function DealerSyncSidebar({
  workspace,
  nav,
  view,
  exceptionCount,
  onNavigate,
  onWorkspaceChange,
}: DealerSyncSidebarProps) {
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const { setOpenMobile } = useSidebar();
  const primary = nav.slice(0, workspace === "dealer" ? 4 : 5);
  const secondary = nav.slice(workspace === "dealer" ? 4 : 5);

  function chooseWorkspace(next: Workspace) {
    setWorkspaceMenuOpen(false);
    onWorkspaceChange(next);
    setOpenMobile(false);
  }

  function renderItem(item: SidebarItem) {
    const Icon = item.icon;
    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton
          type="button"
          isActive={view === item.id}
          tooltip={item.label}
          onClick={() => {
            onNavigate(item.id);
            setOpenMobile(false);
          }}
        >
          <Icon size={18} weight="regular" />
          <span>{item.label}</span>
        </SidebarMenuButton>
        {item.id === "exceptions" && (
          <SidebarMenuBadge>{exceptionCount}</SidebarMenuBadge>
        )}
      </SidebarMenuItem>
    );
  }

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="dealersync-sidebar">
      <SidebarHeader className="dealersync-sidebar-header">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="DealerSync" className="dealersync-brand">
              <span className="dealersync-brand-mark" aria-hidden="true">
                <ShieldCheck size={20} weight="fill" />
              </span>
              <span className="dealersync-brand-copy">
                <strong>DealerSync</strong>
                <small>Reconciliation workspace</small>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="dealersync-workspace-picker">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                type="button"
                size="lg"
                tooltip={workspace === "dealer" ? "Northfield Auto Group" : "Ontario review cohort"}
                isActive={workspaceMenuOpen}
                onClick={() => setWorkspaceMenuOpen((current) => !current)}
                aria-expanded={workspaceMenuOpen}
                className="dealersync-workspace-button"
              >
                <Buildings size={18} />
                <span className="dealersync-workspace-copy">
                  <strong>{workspace === "dealer" ? "Northfield Auto Group" : "Ontario review cohort"}</strong>
                  <small>{workspace === "dealer" ? "Ontario · ON-041023" : "142 dealerships"}</small>
                </span>
                <CaretDown size={14} className="dealersync-workspace-chevron" />
              </SidebarMenuButton>
              {workspaceMenuOpen && (
                <div className="dealersync-workspace-menu" role="menu">
                  <p>Switch workspace</p>
                  <button
                    type="button"
                    className={workspace === "dealer" ? "selected" : ""}
                    onClick={() => chooseWorkspace("dealer")}
                    role="menuitem"
                  >
                    <span className="workspace-mark dealer-mark">D</span>
                    <span><strong>Dealership compliance</strong><small>Northfield Auto Group</small></span>
                  </button>
                  <button
                    type="button"
                    className={workspace === "regulator" ? "selected" : ""}
                    onClick={() => chooseWorkspace("regulator")}
                    role="menuitem"
                  >
                    <span className="workspace-mark regulator-mark">R</span>
                    <span><strong>Regulatory review</strong><small>Ontario review cohort</small></span>
                  </button>
                </div>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{primary.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{secondary.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton type="button" tooltip="Settings" onClick={() => { onNavigate("settings"); setOpenMobile(false); }}>
              <Gear size={18} />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton type="button" tooltip="Help centre">
              <Question size={18} />
              <span>Help centre</span>
              <ArrowSquareOut className="sidebar-utility-trailing" size={14} />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton type="button" tooltip="Logout" className="sidebar-logout">
              <SignOut size={18} />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
