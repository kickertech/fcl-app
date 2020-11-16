import { isPlatform } from "@ionic/vue";
import { reactive } from "vue";

const ZC_TYPE = "_fcl._tcp.";
const ZC_DOMAIN = "local.";

const state = reactive({
  services: [] as any[],
  loading: false,
});

let zc: any;

const getZeroconf = async () => {
  const watchCallback = (result: any) => {
    if (result.action == "added" || result.action == "resolved") {
      const services = state.services;

      const idx = services.findIndex(
        (svc) =>
          svc.txtRecord.fingerprint == result.service.txtRecord.fingerprint
      );
      if (idx == -1 && result.service.txtRecord.fingerprint) {
        services.push(result.service);
        state.services = [...services];
      } // zeroconf may return incomplete sets of ip addresses
      else if (
        idx != -1 &&
        result.service.ipv4Addresses.length > services[idx].ipv4Addresses.length
      ) {
        services[idx] = result.service;
        state.services = [...services];
      }
    }
  };

  // we can not import this in the browser
  if (isPlatform("ios") || isPlatform("android")) {
    const native = await import("@ionic-native/zeroconf/ngx");
    let zc = new native.Zeroconf();

    const startWatch = (zc: any) => {
      zc.watch(ZC_TYPE, ZC_DOMAIN).subscribe({
        next: (result: any) => {
          watchCallback(result);
        },
      });
    };

    startWatch(zc);

    return {
      refresh: async () => {
        state.loading = true;
        state.services = [];
        await zc.stop();
        await zc.close();

        zc = new native.Zeroconf();
        startWatch(zc);
        state.loading = false;
      },
    };
  }

  // only for local testing
  state.services = [
    {
      domain: ZC_DOMAIN,
      type: ZC_TYPE,
      name: "froop",
      port: 9901,
      hostname: "",
      ipv4Addresses: ["127.0.0.1", "10.100.10.100"],
      ipv6Addresses: [
        "2001:16b8:6691:df00:7544:a7d1:3544:520e",
        "2001:16b8:6691:df00:cad1:fadd:cbe0:4c4e",
        "fe80::7544:a7d1:3544:520e",
      ],
      txtRecord: {
        fingerprint: "sha256/fuYbd64Gv80HIwxOtDqh+822Cg/ao9OPkP2Iwo2AA7A=",
      },
    },
  ];

  return {
    refresh: async () => {
      /* NOOP */
    },
  };
};

const init = async () => {
  zc = await getZeroconf();
};

const triggerRefresh = async () => {
  if (zc && !state.loading) {
    await zc.refresh();
  }
};

export { init, triggerRefresh, state };
