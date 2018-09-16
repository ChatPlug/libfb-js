export enum QMqttConnectFlag {
    Clr = 1 << 1,
    Wil = 1 << 2,
    Ret = 1 << 5,
    Pass = 1 << 6,
    User = 1 << 7,
    QoS0 = 0 << 3,
    QoS1 = 1 << 3,
    QoS2 = 2 << 3
}

enum QMqttMessageFlag {
    Ret = 1 << 0,
    Dup = 1 << 3,
    QoS0 = 0 << 1,
    QoS1 = 1 << 1,
    QoS2 = 2 << 1
}
